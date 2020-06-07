package websocket

import (
	"net"
	"time"

	"github.com/gobwas/httphead"
	"github.com/gobwas/ws"
	"github.com/jkuri/abstruse/internal/pkg/auth"
	"go.uber.org/zap"
)

// Server contains options and methods for running zero-copy
// websocket server on straight TCP connection. Use in a combination
// of UpstreamHandler.
type Server struct {
	opts      *Options
	logger    *zap.SugaredLogger
	ioTimeout time.Duration
	exit      chan struct{}
	app       *App
}

// NewServer initializes and returns a new websocket server instance.
func NewServer(opts *Options, app *App, logger *zap.Logger) *Server {
	log := logger.With(zap.String("type", "websocket")).Sugar()

	return &Server{
		opts,
		log,
		time.Millisecond * 100,
		make(chan struct{}),
		app,
	}
}

// Start starts the websocket server
func (s *Server) Start() error {
	ln, err := net.Listen("tcp", s.opts.Addr)
	if err != nil {
		return err
	}

	// s.logger.Infof("ws listening on %s", ln.Addr().String())

	go func() {
		for {
			conn, err := ln.Accept()
			if err != nil {
				s.logger.Errorf("error accepting incoming websocket connection: %s", err.Error())
				break
			}
			go s.handle(conn)
		}
	}()

	<-s.exit
	return nil
}

func (s *Server) handle(conn net.Conn) {
	var id int
	var email, fullname string
	var err error

	upgrader := ws.Upgrader{
		OnHost: func(host []byte) error {
			return nil
		},
		OnHeader: func(key, value []byte) error {
			if string(key) != "Cookie" {
				return nil
			}
			ok := httphead.ScanCookie(value, func(key, value []byte) bool {
				if string(key) == "abstruse-auth-token" && string(value) != "" {
					id, email, fullname, _, err = auth.GetUserDataFromJWT(string(value))
					return true
				}
				return false
			})
			if ok {
				return nil
			}
			return ws.RejectConnectionError(
				ws.RejectionReason("authentication failed"),
				ws.RejectionStatus(400),
			)
		},
	}

	if err != nil {
		s.logger.Errorf("%s, websocket connection not upgraded", err.Error())
		return
	}

	_, err = upgrader.Upgrade(conn)
	if err != nil {
		s.logger.Errorf("error upgrading websocket connection: %s", err.Error())
	}

	client := s.app.Register(conn, id, email, fullname)
	if err := s.app.InitClient(client); err != nil {
		s.app.Remove(client)
	}
}

func nameConn(conn net.Conn) string {
	return conn.LocalAddr().String() + " <> " + conn.RemoteAddr().String()
}
