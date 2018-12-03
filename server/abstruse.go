package server

import (
	"log"
	"net/http"
	"path"
	"time"

	"github.com/bleenco/abstruse/db"
	"github.com/bleenco/abstruse/config"
	"github.com/bleenco/abstruse/fs"
	"github.com/bleenco/abstruse/logger"
	"github.com/bleenco/abstruse/security"
	"github.com/bleenco/abstruse/server/websocket"
	"github.com/bleenco/abstruse/api/workers"

	humanize "github.com/dustin/go-humanize"
	"github.com/felixge/httpsnoop"
	"golang.org/x/net/http2"
)

// AbstruseConfig defines configuration of the main master server.
type AbstruseConfig struct {
	HTTPAddress  string
	HTTPSAddress string
	CertFile     string
	KeyFile      string
	GRPCConfig    *GRPCServerConfig
	Dir          string
	Debug        bool
}

// Abstruse represents main master server.
type Abstruse struct {
	config *AbstruseConfig
	router *Router
	server *http.Server
	logger *logger.Logger
	grpcserver *GRPCServer
	ws *websocket.Server
	workersAPI *workers.Workers
	dir    string

	running chan error
}

// NewAbstruse creates a new main master server instance.
func NewAbstruse(c *AbstruseConfig) (*Abstruse, error) {
	dir := c.Dir
	if dir == "" {
		dir, _ = fs.GetHomeDir()
		dir = path.Join(dir, "abstruse")
	}

	cfg := config.ReadAndParseConfig(path.Join(dir, "config.json"))
	security.InitSecurity(cfg.Security)

	if c.CertFile == "" || c.KeyFile == "" {
		c.CertFile = cfg.Security.Cert
		c.KeyFile = cfg.Security.CertKey
	}

	if c.GRPCConfig.Port == 0 {
		c.GRPCConfig.Port = cfg.GRPC.Port
	}

	if !path.IsAbs(cfg.GRPC.Cert) && !path.IsAbs(cfg.GRPC.CertKey) {
		cfg.GRPC.Cert = path.Join(dir, cfg.GRPC.Cert)
		cfg.GRPC.CertKey = path.Join(dir, cfg.GRPC.CertKey)
	}
	security.CheckAndGenerateCert(cfg.GRPC.Cert, cfg.GRPC.CertKey)

	c.GRPCConfig.Cert = cfg.GRPC.Cert
	c.GRPCConfig.CertKey = cfg.GRPC.CertKey

	gRPCServer, err := NewGRPCServer(c.GRPCConfig, logger.NewLogger("grpc", true, c.Debug))
	if err != nil {
		return nil, err
	}

	return &Abstruse{
		config:  c,
		router:  NewRouter(),
		server:  &http.Server{},
		grpcserver: gRPCServer,
		ws: websocket.NewServer("0.0.0.0:7100", 2048, 1, time.Millisecond*100),
		workersAPI: workers.NewWorkersAPI(),
		logger:  logger.NewLogger("", true, c.Debug),
		dir:     dir,
		running: make(chan error, 1),
	}, nil
}

// Run starts the main server instance.
func (a *Abstruse) Run() error {
	if err := a.init(); err != nil {
		return err
	}

	httpLogger := logger.NewLogger("http", a.logger.Info, a.logger.Debug)

	handler := http.HandlerFunc(func(res http.ResponseWriter, req *http.Request) {
		m := httpsnoop.CaptureMetrics(a.router, res, req)
		httpLogger.Debugf(
			"%s %s (code=%d dt=%s written=%s remote=%s)",
			req.Method,
			req.URL,
			m.Code,
			m.Duration,
			humanize.Bytes(uint64(m.Written)),
			req.RemoteAddr,
		)
	})

	if a.config.HTTPAddress != "" {
		go func() {
			httpLogger.Infof("http listening on %s", a.config.HTTPAddress)
			log.Fatal(http.ListenAndServe(a.config.HTTPAddress, handler))
		}()
	}

	if a.config.HTTPSAddress != "" && a.config.CertFile != "" && a.config.KeyFile != "" {
		go func() {
			a.server.Addr = a.config.HTTPSAddress
			a.server.Handler = handler
			http2.ConfigureServer(a.server, nil)

			httpLogger.Infof("https listening on %s", a.config.HTTPSAddress)
			log.Fatal(a.server.ListenAndServeTLS(a.config.CertFile, a.config.KeyFile))
		}()
	}

	go func() {
		if err := a.ws.Run(); err != nil {
			log.Fatal(err)
		}
	}()

	if a.config.GRPCConfig.Cert != "" && a.config.GRPCConfig.CertKey != "" {
		go func() {
			if err := a.grpcserver.Listen(); err != nil {
				log.Fatal(err)
			}
		}()
	} else {
		log.Fatal("gRPC server cannot work without certificate and key path specified. exiting...")
	}

	return a.wait()
}

// Close gracefully stops main server.
func (a *Abstruse) Close() {
	a.logger.Infof("closing down http server...")
	if err := a.server.Close(); err != nil {
		a.running <- err
	}

	a.running <- nil
}

func (a *Abstruse) init() error {
	if !fs.Exists(a.dir) {
		if err := fs.MakeDir(a.dir); err != nil {
			return err
		}
	}

	configPath := a.dir + "/config.json"
	if !fs.Exists(configPath) {
		if err := config.WriteDefaultConfig(configPath); err != nil {
			return err
		}
	}

	config := config.ReadAndParseConfig(configPath)

	dbopts := db.Options{
		Client:   config.Database.Client,
		Hostname: config.Database.Host,
		Port:     config.Database.Port,
		User:     config.Database.User,
		Password: config.Database.Password,
		Database: config.Database.Name,
		Charset:  config.Database.Charset,
	}
	if err := db.Connect(dbopts); err != nil {
		return err
	}

	return nil
}

func (a *Abstruse) wait() error {
	return <-a.running
}
