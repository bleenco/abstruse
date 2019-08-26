package websocket

import (
	"net"
	"time"

	"github.com/gobwas/httphead"
	"github.com/gobwas/ws"
	"github.com/bleenco/abstruse/pkg/logger"
	"github.com/bleenco/abstruse/pkg/security"
)

// Server contains options and methods for running zero-copy
// websocket server on straight TCP connection. Use in a combination
// of UpstreamHandler.
type Server struct {
	logger    *logger.Logger
	addr      string
	ioTimeout time.Duration
	exit      chan struct{}
	app       *Application
}

// NewServer initializes and returns a new websocket server instance.
func NewServer(addr string, workers, queue int, ioTimeout time.Duration) *Server {
	log := logger.NewLogger("websocket", true, true)
	App = NewApplication(log)

	return &Server{
		log,
		addr,
		ioTimeout,
		make(chan struct{}),
		App,
	}
}

// Run starts the websocket server
func (s *Server) Run() error {
	ln, err := net.Listen("tcp", s.addr)
	if err != nil {
		return err
	}

	s.logger.Infof("listening ws server on %s", ln.Addr().String())

	go func() {
		for {
			conn, err := ln.Accept()
			if err != nil {
				s.logger.Debugf("error accepting incoming websocket connection: %s", err.Error())
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
					var err error
					id, email, fullname, _, err = security.GetUserDataFromJWT(string(value))
					if err != nil {
						return false
					}
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

	_, err := upgrader.Upgrade(conn)
	if err != nil {
		s.logger.Debugf("error upgrading websocket connection: %s", err.Error())
	}

	s.logger.Infof("established websocket connection: %s", nameConn(conn))

	client := s.app.Register(conn, id, email, fullname)
	s.app.InitClient(client)
	s.app.Remove(client)
}

func nameConn(conn net.Conn) string {
	return conn.LocalAddr().String() + " <> " + conn.RemoteAddr().String()
}
