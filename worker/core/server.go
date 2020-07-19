package core

import (
	"context"
	"crypto/tls"
	"fmt"
	"net"
	"strings"
	"sync"
	"time"

	pb "github.com/bleenco/abstruse/pb"
	"github.com/bleenco/abstruse/pkg/stats"
	"github.com/bleenco/abstruse/worker/docker"
	"github.com/docker/docker/pkg/jsonmessage"
	"github.com/golang/protobuf/ptypes/empty"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
)

// APIServer represents gRPC server.
type APIServer struct {
	id       string
	addr     string
	mu       sync.Mutex
	listener net.Listener
	server   *grpc.Server
	app      *App
	logger   *zap.SugaredLogger
	logs     map[uint]pb.API_JobLogServer
}

// NewAPIServer returns new instance of APIServer.
func NewAPIServer(app *App) *APIServer {
	return &APIServer{
		addr:   app.addr,
		app:    app,
		logger: app.log.With(zap.String("type", "api")).Sugar(),
		logs:   make(map[uint]pb.API_JobLogServer),
	}
}

// Start starts the API Server.
func (s *APIServer) Start() error {
	var err error
	grpcOpts := []grpc.ServerOption{}
	certificate, err := tls.LoadX509KeyPair(s.app.cfg.TLS.Cert, s.app.cfg.TLS.Key)
	if err != nil {
		return err
	}
	s.listener, err = net.Listen("tcp", s.app.addr)
	if err != nil {
		return err
	}
	creds := credentials.NewTLS(&tls.Config{
		Certificates:       []tls.Certificate{certificate},
		InsecureSkipVerify: true,
	})

	grpcOpts = append(grpcOpts, grpc.Creds(creds))
	grpcOpts = append(grpcOpts, grpc.UnaryInterceptor(s.unaryInterceptor))
	grpcOpts = append(grpcOpts, grpc.StreamInterceptor(s.streamInterceptor))
	s.server = grpc.NewServer(grpcOpts...)
	pb.RegisterAPIServer(s.server, s)
	s.logger.Infof("grpc server listening on %s", s.app.addr)

	return s.server.Serve(s.listener)
}

// Stop stops the API server.
func (s *APIServer) Stop() {
	s.server.Stop()
}

// Usage returns stream of health data.
func (s *APIServer) Usage(stream pb.API_UsageServer) error {
	errch := make(chan error)
	s.app.logger.Infof("service ready to accept jobs")

	send := func(stream pb.API_UsageServer) error {
		cpu, mem := stats.GetUsageStats()
		if err := stream.Send(&pb.UsageStatsReply{
			Cpu: cpu,
			Mem: mem,
		}); err != nil {
			return err
		}
		return nil
	}

	go func() {
		_, err := stream.Recv()
		if err != nil {
			s.app.errch <- err
		}
	}()

	go func() {
		if err := send(stream); err != nil {
			errch <- err
		}
		ticker := time.NewTicker(5 * time.Second)
		for range ticker.C {
			if err := send(stream); err != nil {
				ticker.Stop()
				errch <- err
			}
		}
	}()

	return <-errch
}

// HostInfo returns worker host information.
func (s *APIServer) HostInfo(ctx context.Context, in *empty.Empty) (*pb.HostInfoReply, error) {
	info, err := stats.GetHostStats()
	if err != nil {
		return nil, err
	}

	return &pb.HostInfoReply{
		Id:                   s.id,
		Addr:                 s.addr,
		Hostname:             info.Hostname,
		Uptime:               info.Uptime,
		BootTime:             info.BootTime,
		Procs:                info.Procs,
		Os:                   info.OS,
		Platform:             info.Platform,
		PlatformFamily:       info.PlatformFamily,
		PlatformVersion:      info.PlatformVersion,
		KernelVersion:        info.KernelVersion,
		KernelArch:           info.KernelArch,
		VirtualizationSystem: info.VirtualizationRole,
		VirtualizationRole:   info.VirtualizationRole,
		HostID:               info.HostID,
		MaxParallel:          uint64(s.app.scheduler.max),
	}, nil
}

// JobLog returns stream of job container output data.
func (s *APIServer) JobLog(in *pb.Job, stream pb.API_JobLogServer) error {
	s.mu.Lock()
	id := uint(in.GetId())
	s.logs[id] = stream
	s.mu.Unlock()

	select {
	case <-stream.Context().Done():
		s.mu.Lock()
		delete(s.logs, id)
		s.mu.Unlock()
		return stream.Context().Err()
	}
}

// BuildImage builds Docker image and streams current status of the build process.
func (s *APIServer) BuildImage(in *pb.Image, stream pb.API_BuildImageServer) error {
	var tags []string
	for _, tag := range in.Tags {
		tags = append(tags, fmt.Sprintf("%s:%s", in.Name, tag))
	}

	resp, err := docker.BuildImage(tags, in.Dockerfile)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	var ev jsonmessage.JSONMessage
	outch := make(chan jsonmessage.JSONMessage)

	go docker.StreamImageEvents(outch, resp.Body)
	for ev = range outch {
		out := &pb.ImageOutput{
			Name:    in.Name,
			Tags:    in.Tags,
			Content: []byte(ev.Stream),
			Status:  pb.ImageOutput_BuildStream,
		}
		if err := stream.Send(out); err != nil {
			return err
		}
	}
	if !strings.HasPrefix(ev.Stream, "Successfully") {
		out := &pb.ImageOutput{
			Name:    in.Name,
			Tags:    in.Tags,
			Content: []byte(ev.ErrorMessage),
			Status:  pb.ImageOutput_BuildError,
		}
		if serr := stream.Send(out); serr != nil {
			return serr
		}
		return fmt.Errorf(ev.ErrorMessage)
	}
	out := &pb.ImageOutput{
		Name:    in.Name,
		Tags:    in.Tags,
		Content: []byte{},
		Status:  pb.ImageOutput_BuildOK,
	}
	if err := stream.Send(out); err != nil {
		return err
	}

	for _, tag := range tags {
		outch = make(chan jsonmessage.JSONMessage)
		splitted := strings.Split(tag, ":")

		out, err := docker.PushImage(tag)
		if err != nil {
			return err
		}
		defer out.Close()
		go docker.StreamImageEvents(outch, out)
		for ev = range outch {
			out := &pb.ImageOutput{
				Name:    in.Name,
				Tags:    []string{splitted[1]},
				Content: []byte(ev.ProgressMessage),
				Status:  pb.ImageOutput_PushStream,
			}
			if err := stream.Send(out); err != nil {
				return err
			}
		}

		if ev.Error != nil {
			out := &pb.ImageOutput{
				Name:    in.Name,
				Tags:    []string{splitted[1]},
				Content: []byte(ev.ErrorMessage),
				Status:  pb.ImageOutput_PushError,
			}
			if err := stream.Send(out); err != nil {
				return err
			}
		} else {
			// status := strings.Split(ev.Status, " ")
			digest := fmt.Sprintf("%+v", ev.Status)
			out := &pb.ImageOutput{
				Name:    in.Name,
				Tags:    []string{splitted[1]},
				Content: []byte(digest),
				Status:  pb.ImageOutput_PushOK,
			}
			if err := stream.Send(out); err != nil {
				return err
			}
		}
	}

	return nil
}
