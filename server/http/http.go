package http

import (
	"fmt"
	"net"
	"net/http"

	"github.com/dustin/go-humanize"
	"github.com/felixge/httpsnoop"
	"github.com/bleenco/abstruse/server/api"
	"github.com/bleenco/abstruse/server/config"
	"go.uber.org/zap"
)

// Server extends net/http Server with graceful shutdowns.
type Server struct {
	*http.Server
	router    *api.Router
	config    *config.HTTP
	logger    *zap.SugaredLogger
	listener  net.Listener
	isRunning bool
	running   chan error
}

// New creates a new HTTP server instance.
func New(config *config.Config, logger *zap.Logger, router *api.Router) *Server {
	return &Server{
		Server:  &http.Server{},
		router:  router,
		logger:  logger.With(zap.String("type", "http")).Sugar(),
		config:  config.HTTP,
		running: make(chan error),
	}
}

// Run starts HTTP server instance and listens of specified port.
func (s Server) Run() error {
	addr := s.config.Addr
	listener, err := net.Listen("tcp", addr)
	if err != nil {
		return err
	}
	s.Handler = s.logHandler(s.router.Handler())

	s.logger.Infof("starting HTTP server on %s", addr)

	go s.closeWith(s.Serve(listener))

	return nil
}

// Close closes the HTTP Server instance
func (s Server) Close() error {
	s.closeWith(nil)
	return s.listener.Close()
}

// Wait waits for server to be stopped
func (s Server) Wait() error {
	if !s.isRunning {
		return fmt.Errorf("already closed")
	}
	return <-s.running
}

func (s Server) closeWith(err error) {
	if !s.isRunning {
		return
	}
	s.isRunning = false
	s.running <- err
}

func (s Server) logHandler(handler http.Handler) http.Handler {
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
