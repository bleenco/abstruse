package grpc

import (
	"crypto/tls"
	"fmt"
	"net"

	"github.com/jkuri/abstruse/internal/pkg/certgen"
	pb "github.com/jkuri/abstruse/proto"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
)

// Server defines gRPC server.
type Server struct {
	opts   *Options
	logger *zap.SugaredLogger
	server *grpc.Server
}

// NewServer returns new instance of gRPC server.
func NewServer(opts *Options, logger *zap.Logger) (*Server, error) {
	log := logger.With(zap.String("type", "grpc")).Sugar()
	if opts.Addr == "" {
		return nil, fmt.Errorf("listen address must be specified")
	}
	if opts.Cert == "" || opts.Key == "" {
		return nil, fmt.Errorf("cert and key must be specified")
	}
	if err := certgen.CheckAndGenerateCert(opts.Cert, opts.Key); err != nil {
		return nil, err
	}

	return &Server{
		opts:   opts,
		logger: log,
	}, nil
}

// Start starts gRPC server.
func (s *Server) Start() error {
	grpcOpts := []grpc.ServerOption{}

	certificate, err := tls.LoadX509KeyPair(s.opts.Cert, s.opts.Key)
	if err != nil {
		return err
	}

	listener, err := net.Listen("tcp", s.opts.Addr)
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

	s.logger.Infof("gRPC server listening on %s", s.opts.Addr)

	return s.server.Serve(listener)
}

// Addr returns server's listen address.
func (s *Server) Addr() string {
	return s.opts.Addr
}
