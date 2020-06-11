package app

import (
	"context"
	"crypto/tls"
	"net"
	"sync"
	"time"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/empty"
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
		logger: app.logger.With(zap.String("type", "api")).Sugar(),
		logs:   make(map[uint]pb.API_JobLogServer),
	}
}

// Start starts the API Server.
func (s *APIServer) Start() error {
	var err error
	grpcOpts := []grpc.ServerOption{}
	certificate, err := tls.LoadX509KeyPair(s.app.opts.TLS.Cert, s.app.opts.TLS.Key)
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

// Usage returns stream of health data.
func (s *APIServer) Usage(stream pb.API_UsageServer) error {
	errch := make(chan error)
	send := func(stream pb.API_UsageServer) error {
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
		MaxConcurrency:       uint64(s.app.scheduler.max),
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
		return stream.Context().Err()
	}
}
