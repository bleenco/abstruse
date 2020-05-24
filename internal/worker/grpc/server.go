package grpc

import (
	"crypto/tls"
	"net"

	"github.com/jkuri/abstruse/internal/worker/options"
	pb "github.com/jkuri/abstruse/proto"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
)

// Server defines gRPC server.
type Server struct {
	id     string
	addr   string
	opts   *options.Options
	logger *zap.SugaredLogger
	server *grpc.Server
}

// NewServer returns new instance of gRPC server.
func NewServer(id, addr string, opts *options.Options, logger *zap.Logger) *Server {
	return &Server{
		id:     id,
		addr:   addr,
		opts:   opts,
		logger: logger.With(zap.String("type", "grpc")).Sugar(),
	}
}

// Start starts gRPC server.
func (s *Server) Start() error {
	grpcOpts := []grpc.ServerOption{}

	certificate, err := tls.LoadX509KeyPair(s.opts.Cert, s.opts.Key)
	if err != nil {
		return err
	}

	listener, err := net.Listen("tcp", s.opts.GRPC.ListenAddr)
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

	s.logger.Infof("gRPC server listening on %s", s.opts.GRPC.ListenAddr)

	return s.server.Serve(listener)
}
