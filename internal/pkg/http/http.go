package http

import (
	"context"
	"net/http"
	"time"

	"github.com/dustin/go-humanize"
	"github.com/felixge/httpsnoop"
	"github.com/google/wire"
	"github.com/spf13/viper"
	"go.uber.org/zap"
)

// Options defines configuration for http server.
type Options struct {
	Addr string
	Cert string
	Key  string
}

// Server represents HTTP server.
type Server struct {
	opts       *Options
	logger     *zap.SugaredLogger
	router     *Router
	httpServer *http.Server
}

// NewOptions returns configuration fro HTTP server.
func NewOptions(v *viper.Viper) (*Options, error) {
	var (
		err error
		o   = new(Options)
	)

	if err = v.UnmarshalKey("http", o); err != nil {
		return nil, err
	}

	return o, err
}

// NewServer returns new HTTP server instance.
func NewServer(opts *Options, logger *zap.Logger, router *Router) (*Server, error) {
	return &Server{
		opts:       opts,
		router:     router,
		httpServer: &http.Server{},
		logger:     logger.With(zap.String("type", "http")).Sugar(),
	}, nil
}

// Start starts the HTTP server.
func (s *Server) Start() error {
	errch := make(chan error)

	s.httpServer.Addr = s.opts.Addr
	s.httpServer.Handler = http.HandlerFunc(func(res http.ResponseWriter, req *http.Request) {
		m := httpsnoop.CaptureMetrics(s.router, res, req)
		s.logger.Debugf(
			"%s %s (code=%d dt=%s written=%s remote=%s)",
			req.Method,
			req.URL,
			m.Code,
			m.Duration,
			humanize.Bytes(uint64(m.Written)),
			req.RemoteAddr,
		)
	})
	s.logger.Infof("starting http server on %s", s.opts.Addr)

	go func() {
		if err := s.httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			s.logger.Fatalf("start http server error: %v", err)
		}
	}()

	return <-errch
}

// Stop stops HTTP server.
func (s *Server) Stop() error {
	s.logger.Info("stopping http server...")
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()

	if err := s.httpServer.Shutdown(ctx); err != nil {
		return err
	}

	return nil
}

// ProviderSet export.
var ProviderSet = wire.NewSet(NewServer, NewOptions, NewRouter)
