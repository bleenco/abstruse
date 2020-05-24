package grpc

import (
	"crypto/tls"
	"fmt"
	"net"
	"strings"

	"github.com/jkuri/abstruse/internal/pkg/certgen"
	"github.com/jkuri/abstruse/internal/pkg/fs"
	"github.com/jkuri/abstruse/internal/pkg/id"
	"github.com/jkuri/abstruse/internal/worker/etcd"
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
	etcd   *etcd.App
}

// NewServer returns new instance of gRPC server.
func NewServer(opts *options.Options, logger *zap.Logger, etcd *etcd.App) (*Server, error) {
	log := logger.With(zap.String("type", "grpc")).Sugar()
	if opts.GRPC.ListenAddr == "" {
		return nil, fmt.Errorf("listen address must be specified")
	}
	if opts.Cert == "" || opts.Key == "" {
		return nil, fmt.Errorf("cert and key must be specified")
	}
	if err := certgen.CheckAndGenerateCert(opts.Cert, opts.Key); err != nil {
		return nil, err
	}
	cert, err := fs.ReadFile(opts.Cert)
	if err != nil {
		return nil, fmt.Errorf("could not read certificate file")
	}
	id := strings.ToUpper(id.New([]byte(fmt.Sprintf("%s-%s", cert, opts.GRPC.ListenAddr)))[0:6])

	return &Server{
		id:     id,
		addr:   opts.GRPC.ListenAddr,
		opts:   opts,
		logger: log,
		etcd:   etcd,
	}, nil
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

// Addr returns server's listen address.
func (s *Server) Addr() string {
	return s.opts.GRPC.ListenAddr
}

// ID returns id.
func (s *Server) ID() string {
	return s.id
}
