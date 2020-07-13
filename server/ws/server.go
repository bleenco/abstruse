package ws

import (
	"net"
	"net/http"
	"time"

	"github.com/bleenco/abstruse/internal/version"
	"github.com/bleenco/abstruse/server/auth"
	"github.com/bleenco/abstruse/server/config"
	"github.com/gobwas/httphead"
	"github.com/gobwas/ws"
	"go.uber.org/zap"
)

// Server contains options and methods for running zero-copy
// websocket server on straight TCP connection. Use in a combination
// of UpstreamHandler.
type Server struct {
	cfg       *config.Config
	logger    *zap.SugaredLogger
	ioTimeout time.Duration
	exit      chan struct{}
	App       *App
}

// NewServer initializes and returns a new websocket server instance.
func NewServer(cfg *config.Config, logger *zap.Logger) *Server {
	log := logger.With(zap.String("type", "websocket")).Sugar()
	return &Server{
		cfg:       cfg,
		logger:    log,
		ioTimeout: 100 * time.Millisecond,
		exit:      make(chan struct{}),
		App:       NewApp(log),
	}
}

// Run starts the websocket server.
func (s *Server) Run() error {
	listener, err := net.Listen("tcp", s.cfg.WebSocket.Addr)
	if err != nil {
		return err
	}
	s.logger.Debugf("starting websocket server on ws://%s", s.cfg.WebSocket.Addr)

	go func() {
		for {
			conn, err := listener.Accept()
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
	var claims auth.UserClaims
	var err error

	header := ws.HandshakeHeaderHTTP(http.Header{
		"X-Abstruse-Version": []string{version.APIVersion},
	})

	upgrader := ws.Upgrader{
		OnHost: func(host []byte) error {
			return nil
		},
		OnHeader: func(key, value []byte) error {
			if string(key) != "Cookie" {
				return nil
			}
			ok := httphead.ScanCookie(value, func(key, value []byte) bool {
				if string(key) == "jwt" && string(value) != "" {
					claims, err = auth.UserClaimsFromJWT(string(value))
				}
				return true
			})
			if ok && err == nil {
				return nil
			}
			return ws.RejectConnectionError(
				ws.RejectionReason("authentication failed"),
				ws.RejectionStatus(http.StatusUnauthorized),
			)
		},
		OnBeforeUpgrade: func() (ws.HandshakeHeader, error) {
			return header, nil
		},
	}

	if err != nil {
		s.logger.Errorf("websocket connection not upgraded: %s", err.Error())
		return
	}

	if _, err := upgrader.Upgrade(conn); err != nil {
		s.logger.Errorf("error upgrading websocket connection %s: %s", nameConn(conn), err.Error())
		return
	}

	// register client in app here.
	client := s.App.Register(conn, claims)
	if err := s.App.InitClient(client); err != nil {
		s.App.Remove(client)
	}
}

func nameConn(conn net.Conn) string {
	return conn.LocalAddr().String() + " <> " + conn.RemoteAddr().String()
}
