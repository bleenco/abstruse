package api

import (
	"fmt"
	"net"
	"net/http"

	"go.uber.org/zap"
)

// Server extends net/http Server with graceful shutdowns.
type Server struct {
	*http.Server
	listener  net.Listener
	isRunning bool
	running   chan error
	logger    *zap.SugaredLogger
}

// NewServer creates a new HTTP Server instance.
func NewServer(logger *zap.SugaredLogger) *Server {
	return &Server{
		Server:  &http.Server{},
		running: make(chan error),
		logger:  logger,
	}
}

// Run starts HTTP Server instance and listens on specified port.
func (s *Server) Run() error {
	addr := "0.0.0.0:80"
	listener, err := net.Listen("tcp", addr)
	if err != nil {
		return err
	}
	s.Handler = newRouter()
	s.listener = listener

	s.logger.Infof("Starting HTTP server on %s", addr)

	go s.closeWith(s.Serve(listener))
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
