package server

import (
	"github.com/bleenco/abstruse/security"
	"context"
	"crypto/tls"
	"fmt"
	"io"
	"net"
	"os"
	"strconv"
	"strings"

	"github.com/bleenco/abstruse/logger"
	pb "github.com/bleenco/abstruse/proto"
	"github.com/golang/protobuf/ptypes/empty"
	"github.com/pkg/errors"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"google.golang.org/grpc/metadata"
)

type contextKey int

const (
	workerIdentifierKey contextKey = iota
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
func NewGRPCServer(cfg *GRPCServerConfig, logger *logger.Logger) (*GRPCServer, error) {
	if cfg.Port == 0 {
		return nil, errors.Errorf("port must be specified")
	}

	server := &GRPCServer{
		port:     cfg.Port,
		cert:     cfg.Cert,
		certkey:  cfg.CertKey,
		logger:   logger,
		registry: NewWorkerRegistry(logger),
	}

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
			if !s.registry.IsSubscribed(identifier) {
				s.registry.Subscribe(identifier)
			}
		}
	}

end:
	if s.registry.IsSubscribed(identifier) {
		s.registry.Unsubscribe(identifier)
	}

	if err := stream.SendAndClose(&empty.Empty{}); err != nil {
		return err
	}

	return nil
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

func streamInterceptor(srv interface{}, stream grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
	ctx := stream.Context()
	server, ok := srv.(*GRPCServer)
	if !ok {
		return fmt.Errorf("unable to cast server")
	}

	_, err := authenticateWorker(ctx, server)
	if err != nil {
		return err
	}

	return handler(srv, stream)
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
