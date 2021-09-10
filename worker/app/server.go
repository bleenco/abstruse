package app

import (
	"context"
	"crypto/tls"
	"fmt"
	"net"
	"os"
	"strings"
	"sync"
	"time"

	pb "github.com/bleenco/abstruse/pb"
	"github.com/bleenco/abstruse/pkg/fs"
	"github.com/bleenco/abstruse/pkg/stats"
	"github.com/bleenco/abstruse/worker/config"
	"github.com/bleenco/abstruse/worker/docker"
	"github.com/bleenco/abstruse/worker/git"
	"github.com/golang/protobuf/ptypes/empty"
	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_recovery "github.com/grpc-ecosystem/go-grpc-middleware/recovery"
	"github.com/logrusorgru/aurora"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
)

// Server represents gRPC server.
type Server struct {
	mu       sync.Mutex
	config   *config.Config
	id       string
	addr     string
	listener net.Listener
	server   *grpc.Server
	app      *App
	logger   *zap.SugaredLogger
	jobs     map[uint64]*pb.Job
	errch    chan error
}

// NewServer returns new gRPC server.
func NewServer(config *config.Config, logger *zap.Logger, app *App) *Server {
	return &Server{
		config: config,
		id:     config.ID,
		addr:   config.GRPC.Addr,
		app:    app,
		logger: logger.With(zap.String("type", "server")).Sugar(),
		jobs:   make(map[uint64]*pb.Job),
		errch:  make(chan error),
	}
}

// Run starts the gRPC server.
func (s *Server) Run() error {
	var err error
	grpcOpts := []grpc.ServerOption{}
	certificate, err := tls.LoadX509KeyPair(s.config.TLS.Cert, s.config.TLS.Key)
	if err != nil {
		return err
	}
	s.listener, err = net.Listen("tcp", s.config.GRPC.Addr)
	if err != nil {
		return err
	}
	creds := credentials.NewTLS(&tls.Config{
		Certificates:       []tls.Certificate{certificate},
		InsecureSkipVerify: true,
	})

	grpcOpts = append(grpcOpts, grpc.Creds(creds))
	grpcOpts = append(grpcOpts, grpc.UnaryInterceptor(grpc_middleware.ChainUnaryServer(
		s.unaryInterceptor,
		grpc_recovery.UnaryServerInterceptor(),
	)))
	grpcOpts = append(grpcOpts, grpc.StreamInterceptor(grpc_middleware.ChainStreamServer(
		s.streamInterceptor,
		grpc_recovery.StreamServerInterceptor(),
	)))

	s.server = grpc.NewServer(grpcOpts...)
	pb.RegisterAPIServer(s.server, s)
	s.logger.Infof("grpc server listening on %s", s.config.GRPC.Addr)

	return s.server.Serve(s.listener)
}

// Connect returns worker host information.
func (s *Server) Connect(ctx context.Context, in *empty.Empty) (*pb.HostInfo, error) {
	info, err := stats.GetHostStats()
	if err != nil {
		return nil, err
	}

	return &pb.HostInfo{
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
		MaxParallel:          uint64(s.config.Scheduler.MaxParallel),
	}, nil
}

// Usage returns stream of health data.
func (s *Server) Usage(stream pb.API_UsageServer) error {
	errch := make(chan error)
	s.logger.Infof("connection with server successfully initialized")

	send := func(stream pb.API_UsageServer) error {
		cpu, mem := stats.GetUsageStats()
		if err := stream.Send(&pb.UsageStats{
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
			errch <- err
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

	err := <-errch
	s.logger.Errorf("lost connection with server: %s", err.Error())
	s.errch <- err
	return err
}

// StartJob gRPC method.
func (s *Server) StartJob(job *pb.Job, stream pb.API_StartJobServer) error {
	name := fmt.Sprintf("abstruse-job-%d", job.GetId())
	s.logger.Infof("starting job %d with name %s", job.Id, name)

	s.mu.Lock()
	if _, ok := s.jobs[job.Id]; ok {
		docker.StopContainer(name)
		delete(s.jobs, job.Id)
	}
	s.jobs[job.Id] = job
	s.mu.Unlock()

	defer func() {
		s.mu.Lock()
		if _, ok := s.jobs[job.Id]; ok {
			docker.StopContainer(name)
			delete(s.jobs, job.Id)
		}
		s.mu.Unlock()
	}()

	logch := make(chan []byte, 1024)

	go func(job *pb.Job) {
		for output := range logch {
			out := string(output)

			for _, e := range job.Env {
				if e.Secret && strings.Contains(out, e.Value) {
					out = strings.ReplaceAll(out, e.Value, "**********")
				}
			}

			log := &pb.JobResp{Id: job.GetId(), Content: []byte(out), Type: pb.JobResp_Log}
			if err := stream.Send(log); err != nil {
				break
			}
		}
	}(job)

	logch <- []byte(yellow(fmt.Sprintf("==> Starting job %d in %s...\r\n", job.GetId(), name)))

	image := job.Image

	var env []string
	for _, e := range job.GetEnv() {
		env = append(env, fmt.Sprintf("%s=%s", e.Key, e.Value))
	}

	logch <- []byte(yellow("==> Creating temp directory to mount volume... "))
	dir, err := fs.TempDir()
	if err != nil {
		return err
	}
	defer os.RemoveAll(dir)
	logch <- []byte(yellow("done\r\n"))

	if !job.GetSshClone() {
		logch <- []byte(yellow(fmt.Sprintf("==> Cloning repository %s ref: %s sha: %s... ", job.GetUrl(), job.GetRef(), job.GetCommitSHA())))
	} else {
		logch <- []byte(yellow(fmt.Sprintf("==> Cloning repository %s ref: %s sha: %s... ", job.GetSshURL(), job.GetRef(), job.GetCommitSHA())))
	}

	if err := git.CloneRepository(
		job.GetUrl(),
		job.GetRef(),
		job.GetCommitSHA(),
		job.GetProviderToken(),
		dir,
		job.GetSshURL(),
		[]byte(job.GetSshPrivateKey()),
		job.GetSshClone(),
	); err != nil {
		return err
	}
	logch <- []byte(yellow("done\r\n"))

	logch <- []byte(yellow(fmt.Sprintf("==> Pulling image %s (%s)... ", image, job.Platform)))
	if err := docker.PullImage(image, job.Platform, s.config.Registry); err != nil {
		logch <- []byte(fmt.Sprintf("%s\r\n", err.Error()))
	} else {
		logch <- []byte(yellow("done\r\n"))
	}

	ok := true
	s.mu.Lock()
	_, ok = s.jobs[job.Id]
	s.mu.Unlock()

	if !ok {
		return nil
	}

	logch <- []byte(yellow(fmt.Sprintf("==> Starting container %s...\r\n", name)))
	if err := docker.RunContainer(name, image, job, s.config, env, dir, logch); err != nil {
		stream.Send(&pb.JobResp{Id: job.GetId(), Type: pb.JobResp_Done, Status: pb.JobResp_StatusFailing})
		s.logger.Infof("job %d with name %s done with status failing", job.Id, name)
		return err
	}

	stream.Send(&pb.JobResp{Id: job.GetId(), Type: pb.JobResp_Done, Status: pb.JobResp_StatusPassing})
	s.logger.Infof("job %d with name %s done with status success", job.Id, name)

	return nil
}

// StopJob gRPC method.
func (s *Server) StopJob(ctx context.Context, job *pb.Job) (*pb.JobStopResp, error) {
	name := fmt.Sprintf("abstruse-job-%d", job.GetId())
	s.logger.Infof("stopping job %d (%s)...", job.Id, name)
	defer s.logger.Infof("job %d (%s) stopped", job.Id, name)

	defer func() {
		s.mu.Lock()
		delete(s.jobs, job.Id)
		s.mu.Unlock()
	}()

	if _, exists := docker.ContainerExists(name); exists {
		if err := docker.StopContainer(name); err != nil {
			return &pb.JobStopResp{Stopped: false}, nil
		}
		return &pb.JobStopResp{Stopped: true}, nil
	}

	return &pb.JobStopResp{Stopped: false}, nil
}

func (s *Server) Error() chan error {
	return s.errch
}

func yellow(str string) string {
	return aurora.Bold(aurora.Yellow(str)).String()
}
