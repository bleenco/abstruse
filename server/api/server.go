package api

import (
	"fmt"
	"net"
	"net/http"

	"github.com/dustin/go-humanize"
	"github.com/felixge/httpsnoop"
	"github.com/ractol/ractol/server/config"
	"go.uber.org/zap"
)

// Server extends net/http Server with graceful shutdowns.
type Server struct {
	*http.Server
	config    config.Config
	listener  net.Listener
	isRunning bool
	running   chan error
	logger    *zap.SugaredLogger
}

// NewServer creates a new HTTP Server instance.
func NewServer(config config.Config, logger *zap.Logger) *Server {
	return &Server{
		config:  config,
		Server:  &http.Server{},
		running: make(chan error),
		logger:  logger.With(zap.String("type", "http")).Sugar(),
	}
}

// Run starts HTTP Server instance and listens on specified port.
func (s *Server) Run() error {
	addr := s.config.HTTP.Addr
	listener, err := net.Listen("tcp", addr)
	if err != nil {
		return err
	}
	s.Handler = s.logHandler(newRouter())
	s.listener = listener
	scheme := "http"
	if s.config.HTTP.TLS {
		scheme = "https"
	}

	s.logger.Infof("Starting HTTP server on %s://%s", scheme, addr)

	if s.config.HTTP.TLS {
		go s.closeWith(s.ServeTLS(listener, s.config.TLS.Cert, s.config.TLS.Key))
	} else {
		go s.closeWith(s.Serve(listener))
	}

	return nil
}

// Close closes the HTTP Server instance
func (s *Server) Close() error {
	s.closeWith(nil)
	return s.listener.Close()
}

// Wait waits for server to be stopped
func (s *Server) Wait() error {
	if !s.isRunning {
		return fmt.Errorf("already closed")
	}
	return <-s.running
}

func (s *Server) closeWith(err error) {
	if !s.isRunning {
		return
	}
	s.isRunning = false
	s.running <- err
}

func (s *Server) logHandler(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		m := httpsnoop.CaptureMetrics(handler, w, r)
		s.logger.Debugf(
			"%s %s (code=%d dt=%s written=%s remote=%s)",
			r.Method,
			r.URL,
			m.Code,
			m.Duration,
			humanize.Bytes(uint64(m.Written)),
			r.RemoteAddr,
		)
	})
}
