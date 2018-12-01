package server

import (
	"crypto/tls"
	"fmt"
	"io"
	"net"
	"os"
	"strconv"

	"github.com/bleenco/abstruse/logger"
	pb "github.com/bleenco/abstruse/proto"
	"github.com/golang/protobuf/ptypes/empty"
	"github.com/pkg/errors"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
)

// GRPCServer defines gRPC server.
type GRPCServer struct {
	logger  *logger.Logger
	server  *grpc.Server
	port    int
	cert    string
	certkey string
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
		port:    cfg.Port,
		cert:    cfg.Cert,
		certkey: cfg.CertKey,
		logger:  logger,
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

	s.server = grpc.NewServer(grpcOpts...)
	pb.RegisterApiServiceServer(s.server, s)

	s.logger.Infof("grpc http2 server running on 0.0.0.0:%d", s.port)

	return s.server.Serve(listener)
}

// OnlineCheck gRPC channel.
func (s *GRPCServer) OnlineCheck(stream pb.ApiService_OnlineCheckServer) error {
	for {
		status, err := stream.Recv()
		if err != nil {
			goto end
		}

		fmt.Printf("%+v\n", status)
	}

end:
	fmt.Printf("worker disconnected\n")
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

// func unaryInterceptor(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
// 	s, ok := info.Server.(*server)
// 	if !ok {
// 		return nil, fmt.Errorf("unable to cast server")
// 	}
// }
