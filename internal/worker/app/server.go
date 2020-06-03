package app

import (
	"context"
	"crypto/tls"
	"fmt"
	"io"
	"io/ioutil"
	"net"
	"os"
	"path"
	"strings"
	"time"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/empty"
	"github.com/jkuri/abstruse/internal/pkg/scm"
	"github.com/jkuri/abstruse/internal/worker/docker"
	"github.com/jkuri/abstruse/internal/worker/stats"
	pb "github.com/jkuri/abstruse/proto"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
)

// APIServer represents gRPC server.
type APIServer struct {
	id       string
	addr     string
	listener net.Listener
	server   *grpc.Server
	app      *App
	logger   *zap.SugaredLogger

	capacity pb.API_CapacityServer
}

// NewAPIServer returns new instance of APIServer.
func NewAPIServer(app *App) *APIServer {
	return &APIServer{
		addr:   app.addr,
		app:    app,
		logger: app.logger.With(zap.String("type", "api")).Sugar(),
	}
}

// Start starts the API Server.
func (s *APIServer) Start() error {
	var err error
	grpcOpts := []grpc.ServerOption{}
	certificate, err := tls.LoadX509KeyPair(s.app.opts.Cert, s.app.opts.Key)
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
	s.server = grpc.NewServer(grpcOpts...)
	pb.RegisterAPIServer(s.server, s)
	s.logger.Infof("grpc server listening on %s", s.app.addr)
	return s.server.Serve(s.listener)
}

// Stop stops the API server.
func (s *APIServer) Stop() {
	s.server.Stop()
}

// UsageStats returns stream of health data.
func (s *APIServer) UsageStats(stream pb.API_UsageStatsServer) error {
	errch := make(chan error)
	send := func(stream pb.API_UsageStatsServer) error {
		cpu, mem := stats.GetUsageStats()
		if err := stream.Send(&pb.UsageStatsReply{
			Cpu:       cpu,
			Mem:       mem,
			Timestamp: ptypes.TimestampNow(),
		}); err != nil {
			return err
		}
		return nil
	}
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
	}, nil
}

// Capacity returns stream of current worker capacity info.
func (s *APIServer) Capacity(stream pb.API_CapacityServer) error {
	s.capacity = stream
	s.app.emitCapacityInfo()

	for {
		_, err := stream.Recv()
		if err == io.EOF {
			return nil
		}
		if err != nil {
			return err
		}
	}
}

// JobProcess gRPC method.
func (s *APIServer) JobProcess(in *pb.JobTask, stream pb.API_JobProcessServer) error {
	errch := make(chan error)

	s.app.scheduler.add()
	defer s.app.scheduler.done()

	go func() {
		logch := make(chan []byte)
		name := fmt.Sprintf("abstruse-job-%d", in.GetId())
		image := in.GetImage()
		env := in.GetEnv()
		var commands [][]string
		for _, c := range in.GetCommands() {
			commands = append(commands, strings.Split(c, " "))
		}

		go func() {
			for log := range logch {
				jobStatus := &pb.JobStatus{
					Id:      in.GetId(),
					Content: log,
					Code:    pb.JobStatus_Running,
				}
				if err := stream.Send(jobStatus); err != nil {
					if err == io.EOF {
						errch <- nil
					} else {
						errch <- err
					}
				}
			}
		}()

		// TODO: separate func
		dir, err := ioutil.TempDir("/tmp", "abstruse-build")
		if err != nil {
			panic(err)
		}
		defer os.RemoveAll(dir)
		scm, err := scm.NewSCM(context.Background(), in.GetProvider(), in.GetUrl(), in.GetCredentials())
		if err != nil {
			panic(err)
		}
		contents, err := scm.ListContent(in.GetRepo(), in.GetCommitSHA(), "/")
		if err != nil {
			panic(err)
		}
		for _, content := range contents {
			filePath := path.Join(dir, content.Path)
			if err := ioutil.WriteFile(filePath, content.Data, 0644); err != nil {
				panic(err)
			}
		}

		if err := docker.RunContainer(name, image, commands, env, dir, logch); err != nil {
			jobStatus := &pb.JobStatus{
				Id:   in.GetId(),
				Code: pb.JobStatus_Failing,
			}
			if serr := stream.Send(jobStatus); serr != nil && serr != io.EOF {
				errch <- serr
			} else {
				errch <- err
			}
			s.logger.Errorf("%v", err)
		} else {
			jobStatus := &pb.JobStatus{
				Id:   in.GetId(),
				Code: pb.JobStatus_Passing,
			}
			if err := stream.Send(jobStatus); err != nil && err != io.EOF {
				errch <- err
			} else {
				errch <- nil
			}
		}
	}()

	return <-errch
}
