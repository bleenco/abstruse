package httpserver

import (
	"fmt"
	"net"
	"net/http"

	"github.com/dustin/go-humanize"
	"github.com/felixge/httpsnoop"
	"github.com/jkuri/abstruse/pkg/logger"
	"github.com/jkuri/abstruse/pkg/security"
	"golang.org/x/net/http2"
)

// Server represents HTTP server.
type Server struct {
	config  Config
	server  *http.Server
	router  *Router
	handler http.HandlerFunc
	log     *logger.Logger
}

// Config defines HTTP server configuration.
type Config struct {
	Host      string `json:"host"`
	HTTPPort  string `json:"http_port"`
	HTTPSPort string `json:"https_port"`
	Cert      string `json:"cert"`
	Key       string `json:"key"`
}

// NewServer returns HTTP Server instance.
func NewServer(config Config, logLevel string) (*Server, error) {
	srv := &Server{
		config: config,
		server: &http.Server{},
		router: NewRouter(),
		log:    logger.NewLogger("http", logLevel),
	}

	if config.Host == "" {
		return nil, fmt.Errorf("listen host must be specified")
	}

	srv.handler = http.HandlerFunc(func(res http.ResponseWriter, req *http.Request) {
		m := httpsnoop.CaptureMetrics(srv.router, res, req)
		srv.log.Debugf(
			"%s %s (code=%d dt=%s written=%s remote=%s)",
			req.Method,
			req.URL,
			m.Code,
			m.Duration,
			humanize.Bytes(uint64(m.Written)),
			req.RemoteAddr,
		)
	})

	return srv, nil
}

// Run starts http server.
func (s *Server) Run() error {
	errch := make(chan error)

	if s.config.HTTPPort != "" {
		go func() {
			listenAddr := net.JoinHostPort(s.config.Host, s.config.HTTPPort)
			s.log.Infof("http listening on %s", listenAddr)
			if err := http.ListenAndServe(listenAddr, s.handler); err != nil {
				errch <- err
			}
		}()
	}

	if s.config.HTTPSPort != "" && s.config.Cert != "" && s.config.Key != "" {
		go func() {
			if err := security.CheckAndGenerateCert(s.config.Cert, s.config.Key); err != nil {
				errch <- err
			}
			s.server.Addr = net.JoinHostPort(s.config.Host, s.config.HTTPSPort)
			s.server.Handler = s.handler
			http2.ConfigureServer(s.server, nil)
			s.log.Infof("https listening on %s", s.server.Addr)
			if err := s.server.ListenAndServeTLS(s.config.Cert, s.config.Key); err != nil {
				errch <- err
			}
		}()
	}

	return <-errch
}
