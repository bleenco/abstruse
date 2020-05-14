package rpc

import (
	"crypto/tls"
	"fmt"
	"net"

	"github.com/jkuri/abstruse/pkg/logger"
	"github.com/jkuri/abstruse/pkg/security"
	pb "github.com/jkuri/abstruse/proto"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
)

// Server defines gRPC server.
type Server struct {
	log    *logger.Logger
	server *grpc.Server
	addr   string
	cert   string
	key    string
}

// NewServer returns new instance of gRPC server.
func NewServer(config Config, log *logger.Logger) (*Server, error) {
	if config.ListenAddr == "" {
		return nil, fmt.Errorf("listen address must be specified")
	}
	if config.Cert == "" || config.Key == "" {
		return nil, fmt.Errorf("cert and key must be specified")
	}
	if err := security.CheckAndGenerateCert(config.Cert, config.Key); err != nil {
		return nil, err
	}

	return &Server{
		addr: config.ListenAddr,
		cert: config.Cert,
		key:  config.Key,
		log:  log,
	}, nil
}

// Listen starts gRPC server.
func (s *Server) Listen() error {
	grpcOpts := []grpc.ServerOption{}

	certificate, err := tls.LoadX509KeyPair(s.cert, s.key)
	if err != nil {
		return err
	}

	listener, err := net.Listen("tcp", s.addr)
	if err != nil {
		return err
	}

	creds := credentials.NewTLS(&tls.Config{
		Certificates:       []tls.Certificate{certificate},
		InsecureSkipVerify: true,
	})
	grpcOpts = append(grpcOpts, grpc.Creds(creds))

	s.server = grpc.NewServer(grpcOpts...)
	pb.RegisterApiServer(s.server, s)

	s.log.Infof("gRPC server listening on %s", s.addr)

	return s.server.Serve(listener)
}
