package http

import (
	"context"
	"net/http"
	"time"

	"github.com/dustin/go-humanize"
	"github.com/felixge/httpsnoop"
	"github.com/jkuri/abstruse/pkg/server/options"
	"go.uber.org/zap"
	"golang.org/x/net/http2"
)

// Server represents HTTP server.
type Server struct {
	opts        *options.Options
	logger      *zap.SugaredLogger
	tlslogger   *zap.SugaredLogger
	router      *Router
	httpServer  *http.Server
	httpsServer *http.Server
}

// NewServer returns new HTTP server instance.
func NewServer(opts *options.Options, logger *zap.Logger, router *Router) (*Server, error) {
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

	if s.opts.HTTP.Addr != "" {
		s.httpServer.Addr = s.opts.HTTP.Addr
		s.httpServer.Handler = getHandler(s.router, s.logger)
		s.logger.Infof("starting http server on http://%s", s.opts.HTTP.Addr)

		go func() {
			if err := s.httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
				errch <- err
			}
		}()
	}

	if s.opts.HTTP.TLSAddr != "" {
		go func() {
			s.httpsServer.Addr = s.opts.HTTP.TLSAddr
			s.httpsServer.Handler = getHandler(s.router, s.tlslogger)
			http2.ConfigureServer(s.httpsServer, nil)
			s.tlslogger.Infof("starting https server on https://%s", s.opts.HTTP.TLSAddr)
			if err := s.httpsServer.ListenAndServeTLS(s.opts.TLS.Cert, s.opts.TLS.Key); err != nil {
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
