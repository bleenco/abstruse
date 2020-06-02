package http

import (
	"context"
	"net/http"
	"time"

	"github.com/dustin/go-humanize"
	"github.com/felixge/httpsnoop"
	"github.com/google/wire"
	"github.com/jkuri/abstruse/internal/pkg/certgen"
	"github.com/spf13/viper"
	"go.uber.org/zap"
	"golang.org/x/net/http2"
)

// Options defines configuration for http server.
type Options struct {
	Addr    string
	TLSAddr string
	Cert    string
	Key     string
}

// Server represents HTTP server.
type Server struct {
	opts        *Options
	logger      *zap.SugaredLogger
	tlslogger   *zap.SugaredLogger
	router      *Router
	httpServer  *http.Server
	httpsServer *http.Server
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
		opts:        opts,
		router:      router,
		httpServer:  &http.Server{},
		httpsServer: &http.Server{},
		logger:      logger.With(zap.String("type", "http")).Sugar(),
		tlslogger:   logger.With(zap.String("type", "https")).Sugar(),
	}, nil
}

// Start starts the HTTP server.
func (s *Server) Start() error {
	errch := make(chan error)

	if s.opts.Addr != "" {
		s.httpServer.Addr = s.opts.Addr
		s.httpServer.Handler = getHandler(s.router, s.logger)
		s.logger.Infof("starting http server on %s", s.opts.Addr)

		go func() {
			if err := s.httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
				errch <- err
			}
		}()
	}

	if s.opts.TLSAddr != "" && s.opts.Cert != "" && s.opts.Key != "" {
		go func() {
			if err := certgen.CheckAndGenerateCert(s.opts.Cert, s.opts.Key); err != nil {
				errch <- err
			}

			s.httpsServer.Addr = s.opts.TLSAddr
			s.httpsServer.Handler = getHandler(s.router, s.tlslogger)
			http2.ConfigureServer(s.httpsServer, nil)
			s.tlslogger.Infof("starting https server on %s", s.opts.TLSAddr)
			if err := s.httpsServer.ListenAndServeTLS(s.opts.Cert, s.opts.Key); err != nil {
				errch <- err
			}
		}()
	}

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

func getHandler(router *Router, logger *zap.SugaredLogger) http.Handler {
	return http.HandlerFunc(func(res http.ResponseWriter, req *http.Request) {
		m := httpsnoop.CaptureMetrics(router, res, req)
		logger.Debugf(
			"%s %s (code=%d dt=%s written=%s remote=%s)",
			req.Method,
			req.URL,
			m.Code,
			m.Duration,
			humanize.Bytes(uint64(m.Written)),
			req.RemoteAddr,
		)
	})
}

// ProviderSet export.
var ProviderSet = wire.NewSet(NewServer, NewOptions, NewRouter)
