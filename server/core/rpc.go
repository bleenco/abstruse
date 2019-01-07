package core

import (
	"context"
	"crypto/tls"
	"fmt"
	"io"
	"net"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/bleenco/abstruse/pkg/logger"
	"github.com/bleenco/abstruse/pkg/security"
	pb "github.com/bleenco/abstruse/proto"
	"github.com/bleenco/abstruse/server/websocket"
	"github.com/golang/protobuf/ptypes/empty"
	"github.com/pkg/errors"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/peer"
)

// MainGRPCServer is an exported main instance of gRPC server.
var MainGRPCServer *GRPCServer

type contextKey int
type contextIP int

const (
	workerIdentifierKey contextKey = iota
	workerIP            contextIP  = iota
)

// GRPCServer defines gRPC server.
type GRPCServer struct {
	logger   *logger.Logger
	server   *grpc.Server
	registry *WorkerRegistry
	port     int
	cert     string
	certkey  string
}

// GRPCServerConfig defines configuration for gRPC server.
type GRPCServerConfig struct {
	Port    int
	Cert    string
	CertKey string
}

// NewGRPCServer returns new instance of gRPC server.
func NewGRPCServer(cfg *GRPCServerConfig, log *logger.Logger) (*GRPCServer, error) {
	if cfg.Port == 0 {
		return nil, errors.Errorf("port must be specified")
	}

	server := &GRPCServer{
		port:     cfg.Port,
		cert:     cfg.Cert,
		certkey:  cfg.CertKey,
		logger:   log,
		registry: NewWorkerRegistry(logger.NewLogger("registry", log.Info, log.Debug)),
	}
	MainGRPCServer = server

	return server, nil
}

// Listen starts gRPC server.
func (s *GRPCServer) Listen() error {
	grpcOpts := []grpc.ServerOption{}

	if s.cert == "" || s.certkey == "" {
		return errors.New("cert and key are mandatory to run grpc server")
	}

	certificate, err := tls.LoadX509KeyPair(s.cert, s.certkey)
	if err != nil {
		return err
	}

	listener, err := net.Listen("tcp", "0.0.0.0:"+strconv.Itoa(s.port))
	if err != nil {
		return err
	}

	creds := credentials.NewTLS(&tls.Config{
		Certificates:       []tls.Certificate{certificate},
		InsecureSkipVerify: true,
	})
	grpcOpts = append(grpcOpts, grpc.Creds(creds))
	grpcOpts = append(grpcOpts, grpc.UnaryInterceptor(unaryInterceptor))
	grpcOpts = append(grpcOpts, grpc.StreamInterceptor(streamInterceptor))

	s.server = grpc.NewServer(grpcOpts...)
	pb.RegisterApiServiceServer(s.server, s)

	s.logger.Infof("grpc http2 server running on 0.0.0.0:%d", s.port)

	return s.server.Serve(listener)
}

// OnlineCheck gRPC channel.
func (s *GRPCServer) OnlineCheck(stream pb.ApiService_OnlineCheckServer) error {
	var identifier string

	for {
		status, err := stream.Recv()
		if err != nil {
			goto end
		}

		identifier = status.Identifier
		if status.Code == pb.OnlineStatus_Up {
			if !Registry.IsSubscribed(identifier) {
				Registry.Subscribe(identifier)
			}
		}

		ip, _ := stream.Context().Value(workerIP).(string)
		host, _, _ := net.SplitHostPort(ip)
		if status.Code == pb.OnlineStatus_Up {
			WorkersAPI.Subscribe(identifier, host)
		}
	}

end:
	if Registry.IsSubscribed(identifier) {
		Registry.Unsubscribe(identifier)
	}

	WorkersAPI.Unsubscribe(identifier)

	if err := stream.SendAndClose(&empty.Empty{}); err != nil {
		return err
	}

	return nil
}

// WorkerCapacityStatus gRPC channel.
func (s *GRPCServer) WorkerCapacityStatus(stream pb.ApiService_WorkerCapacityStatusServer) error {
	registryItem := &WorkerRegistryItem{}
	ctx := stream.Context()
	identifier, ok := ctx.Value(workerIdentifierKey).(string)
	if !ok {
		return errors.New("identifier not found in stream context")
	}

	for {
		var err error
		registryItem, err = Registry.Find(identifier)
		if err != nil || registryItem == nil {
			continue
		}
		break
	}

	registryItem.WorkerCapacityStatusStream = stream

	for {
		usage, err := stream.Recv()
		if err != nil {
			goto end
		}

		total, used := usage.GetTotal(), usage.GetUsed()
		registryItem.Capacity = int(total)
		registryItem.CapacityUsed = int(used)

		data := map[string]interface{}{
			"cert_id": identifier,
			"total":   total,
			"used":    used,
		}
		websocket.App.Broadcast("worker_capacity", data, "worker_capacity")

		totalCapacity, totalUsed := Registry.GetWorkersCapacityInfo()
		MainScheduler.SetSize(totalCapacity, totalUsed)

		if MainScheduler.queue.count > 0 {
			MainScheduler.RunQueue()
		}
	}

end:
	registryItem.Online = false
	registryItem.WorkerCapacityStatusStream = nil
	registryItem.Capacity = 0
	registryItem.CapacityUsed = 0
	registryItem.CPU = 0
	registryItem.Memory = 0

	totalCapacity, totalUsed := Registry.GetWorkersCapacityInfo()
	MainScheduler.SetSize(totalCapacity, totalUsed)

	if err := stream.SendAndClose(&empty.Empty{}); err != nil {
		return err
	}

	return nil
}

// WorkerUsageStatus gRPC channel.
func (s *GRPCServer) WorkerUsageStatus(stream pb.ApiService_WorkerUsageStatusServer) error {
	registryItem := &WorkerRegistryItem{}
	ctx := stream.Context()
	identifier, ok := ctx.Value(workerIdentifierKey).(string)
	if !ok {
		return errors.New("identifier not found in stream context")
	}

	for {
		var err error
		registryItem, err = Registry.Find(identifier)
		if err != nil || registryItem == nil {
			continue
		}
		break
	}

	registryItem.WorkerUsageStatusStream = stream

	for {
		usage, err := stream.Recv()
		if err != nil {
			goto end
		}

		cpu, memory := usage.GetCpu(), usage.GetMemory()
		registryItem.CPU = int(cpu)
		registryItem.Memory = int(memory)

		data := map[string]interface{}{
			"cert_id": identifier,
			"cpu":     cpu,
			"memory":  memory,
		}
		websocket.App.Broadcast("worker_usage", data, "worker_usage")
	}

end:
	if err := stream.SendAndClose(&empty.Empty{}); err != nil {
		return err
	}
	registryItem.WorkerUsageStatusStream = nil

	return nil
}

// JobProcess gRPC channel.
func (s *GRPCServer) JobProcess(stream pb.ApiService_JobProcessServer) error {
	registryItem := &WorkerRegistryItem{}
	ctx := stream.Context()
	identifier, ok := ctx.Value(workerIdentifierKey).(string)
	if !ok {
		return errors.New("identifier not found in stream context")
	}

	for {
		var err error
		registryItem, err = Registry.Find(identifier)
		if err != nil || registryItem == nil {
			continue
		}
		break
	}

	registryItem.JobProcessStream = stream

	for {
		jobStatus, err := stream.Recv()
		if err != nil {
			registryItem.JobProcessStream = nil
			if err == io.EOF {
				return nil
			}
			return err
		}

		jobProcess, err := MainScheduler.findJobProcess(jobStatus.GetName())
		if err != nil {
			s.logger.Debugf("error adding job process to slice: %s", jobStatus.GetId())
			continue
		}
		jobProcess.ContainerID = jobStatus.GetId()
		jobProcess.WorkerIdentifier = identifier

		status := jobStatus.GetCode()

		switch status {
		case pb.JobStatus_Queued:
			jobProcess.Status = "queued"
		case pb.JobStatus_Running:
			jobProcess.Status = "running"
			jobProcess.StartTime = time.Now()
		case pb.JobStatus_Passing:
			jobProcess.Status = "passing"
			jobProcess.EndTime = time.Now()
		case pb.JobStatus_Failing:
			jobProcess.Status = "failing"
			jobProcess.EndTime = time.Now()
		}

		if status == pb.JobStatus_Passing || status == pb.JobStatus_Failing || status == pb.JobStatus_Stopped {
			MainScheduler.FinishJobTask(jobProcess)
		}
	}
}

// ContainerOutput gRPC channel.
func (s *GRPCServer) ContainerOutput(stream pb.ApiService_ContainerOutputServer) error {
	for {
		chunk, err := stream.Recv()

		if err != nil {
			if err == io.EOF {
				return nil
			}

			return err
		}

		if err := MainScheduler.AppendLog(chunk.Id, chunk.Name, string(chunk.Content)); err != nil {
			s.logger.Debugf("error: %s", err.Error())
		}
	}
}

// Upload gRPC channel
func (s *GRPCServer) Upload(stream pb.ApiService_UploadServer) error {
	file, err := os.Create("/Users/jan/Desktop/test-file")
	if err != nil {
		return err
	}
	defer file.Close()

	for {
		chunk, err := stream.Recv()

		if err != nil {
			if err == io.EOF {
				goto end
			}

			return errors.New("failed unexpectedely while reading chunks from stream")
		}

		if _, err := file.Write(chunk.Content); err != nil {
			return err
		}
	}

end:
	if err := stream.SendAndClose(&pb.TransferStatus{
		Message: "upload received successfully",
		Code:    pb.TransferStatusCode_Ok,
	}); err != nil {
		return errors.New("failed to send status code")
	}

	return nil
}

// Close stops gRPC server gracefully.
func (s *GRPCServer) Close() {
	if s.server != nil {
		s.server.Stop()
	}
}

func unaryInterceptor(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
	server, ok := info.Server.(*GRPCServer)
	if !ok {
		return nil, fmt.Errorf("unable to cast server")
	}

	identifier, err := authenticateWorker(ctx, server)
	if err != nil {
		return nil, err
	}

	ctx = context.WithValue(ctx, workerIdentifierKey, identifier)

	return handler(ctx, req)
}

type grpcServerStream struct {
	identifier string
	ip         string
	grpc.ServerStream
}

func (s grpcServerStream) Context() context.Context {
	c := context.WithValue(s.ServerStream.Context(), workerIdentifierKey, s.identifier)
	c = context.WithValue(c, workerIP, s.ip)
	return c
}

func streamInterceptor(srv interface{}, stream grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
	ctx := stream.Context()
	server, ok := srv.(*GRPCServer)
	if !ok {
		return fmt.Errorf("unable to cast server")
	}

	identifier, err := authenticateWorker(ctx, server)
	if err != nil {
		return err
	}

	s := grpcServerStream{
		identifier:   identifier,
		ServerStream: stream,
	}

	if peer, ok := peer.FromContext(ctx); ok {
		s.ip = peer.Addr.String()
	}

	return handler(srv, s)
}

func authenticateWorker(ctx context.Context, s *GRPCServer) (string, error) {
	if md, ok := metadata.FromIncomingContext(ctx); ok {
		identifier := strings.Join(md["identifier"], "")
		jwt := strings.Join(md["jwt"], "")

		calcID, err := security.GetWorkerIdentifierByJWT(jwt)
		if err != nil {
			return "", fmt.Errorf("invalid credentials")
		}

		if calcID == identifier {
			return identifier, nil
		}

		return "", fmt.Errorf("invalid credentials")
	}

	return "", fmt.Errorf("missing credentials")
}
