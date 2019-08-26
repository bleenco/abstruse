package server

import (
	"log"
	"net/http"
	"path"
	"time"

	"github.com/bleenco/abstruse/pkg/fs"
	"github.com/bleenco/abstruse/pkg/logger"
	"github.com/bleenco/abstruse/pkg/security"
	"github.com/bleenco/abstruse/server/config"
	"github.com/bleenco/abstruse/server/core"
	"github.com/bleenco/abstruse/server/db"
	"github.com/bleenco/abstruse/server/websocket"

	humanize "github.com/dustin/go-humanize"
	"github.com/felixge/httpsnoop"
	"golang.org/x/net/http2"
)

// AbstruseConfig defines configuration of the main master server.
type AbstruseConfig struct {
	HTTPAddress      string
	HTTPSAddress     string
	CertFile         string
	KeyFile          string
	GRPCServerConfig *core.GRPCServerConfig
	Dir              string
	Debug            bool
}

// Abstruse represents main master server.
type Abstruse struct {
	config     *AbstruseConfig
	router     *Router
	server     *http.Server
	logger     *logger.Logger
	grpcserver *core.GRPCServer
	Scheduler  *core.Scheduler
	ws         *websocket.Server
	workersAPI *core.Workers
	dir        string

	running chan error
}

// NewAbstruse creates a new main master server instance.
func NewAbstruse(c *AbstruseConfig) (*Abstruse, error) {
	dir := c.Dir
	if dir == "" {
		dir, _ = fs.GetHomeDir()
		dir = path.Join(dir, "abstruse")
	}

	if !fs.Exists(dir) {
		if err := fs.MakeDir(dir); err != nil {
			return nil, err
		}
	}

	configPath := path.Join(dir, "config.json")
	if !fs.Exists(configPath) {
		if err := config.WriteDefaultConfig(configPath); err != nil {
			return nil, err
		}
	}

	cfg := config.ReadAndParseConfig(configPath)
	security.InitSecurity(cfg.Security)

	if c.CertFile == "" || c.KeyFile == "" {
		c.CertFile = cfg.Security.Cert
		c.KeyFile = cfg.Security.CertKey
	}

	if c.GRPCServerConfig.Port == 0 {
		c.GRPCServerConfig.Port = cfg.GRPC.Port
	}

	if !path.IsAbs(cfg.GRPC.Cert) && !path.IsAbs(cfg.GRPC.CertKey) {
		cfg.GRPC.Cert = path.Join(dir, cfg.GRPC.Cert)
		cfg.GRPC.CertKey = path.Join(dir, cfg.GRPC.CertKey)
	}
	security.CheckAndGenerateCert(cfg.GRPC.Cert, cfg.GRPC.CertKey)

	c.GRPCServerConfig.Cert = cfg.GRPC.Cert
	c.GRPCServerConfig.CertKey = cfg.GRPC.CertKey

	gRPCServer, err := core.NewGRPCServer(c.GRPCServerConfig, logger.NewLogger("grpc", true, c.Debug))
	if err != nil {
		return nil, err
	}

	return &Abstruse{
		config:     c,
		router:     NewRouter(),
		server:     &http.Server{},
		grpcserver: gRPCServer,
		Scheduler:  core.NewScheduler(logger.NewLogger("scheduler", true, c.Debug)),
		ws:         websocket.NewServer("0.0.0.0:7100", 2048, 1, time.Millisecond*100),
		workersAPI: core.NewWorkersAPI(),
		logger:     logger.NewLogger("", true, c.Debug),
		dir:        dir,
		running:    make(chan error, 1),
	}, nil
}

// Run starts the main server instance.
func (abstruse *Abstruse) Run() error {
	if err := abstruse.init(); err != nil {
		return err
	}

	httpLogger := logger.NewLogger("http", abstruse.logger.Info, abstruse.logger.Debug)

	handler := http.HandlerFunc(func(res http.ResponseWriter, req *http.Request) {
		m := httpsnoop.CaptureMetrics(abstruse.router, res, req)
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

	if abstruse.config.HTTPAddress != "" {
		go func() {
			httpLogger.Infof("http listening on %s", abstruse.config.HTTPAddress)
			log.Fatal(http.ListenAndServe(abstruse.config.HTTPAddress, handler))
		}()
	}

	if abstruse.config.HTTPSAddress != "" && abstruse.config.CertFile != "" && abstruse.config.KeyFile != "" {
		go func() {
			abstruse.server.Addr = abstruse.config.HTTPSAddress
			abstruse.server.Handler = handler
			http2.ConfigureServer(abstruse.server, nil)

			httpLogger.Infof("https listening on %s", abstruse.config.HTTPSAddress)
			log.Fatal(abstruse.server.ListenAndServeTLS(abstruse.config.CertFile, abstruse.config.KeyFile))
		}()
	}

	go func() {
		if err := abstruse.ws.Run(); err != nil {
			log.Fatal(err)
		}
	}()

	if abstruse.config.GRPCServerConfig.Cert != "" && abstruse.config.GRPCServerConfig.CertKey != "" {
		go func() {
			if err := abstruse.grpcserver.Listen(); err != nil {
				log.Fatal(err)
			}
		}()
	} else {
		log.Fatal("gRPC server cannot work without certificate and key path specified. exiting...")
	}

	return abstruse.wait()
}

// Close gracefully stops main server.
func (abstruse *Abstruse) Close() {
	abstruse.logger.Infof("closing down http server...")
	if err := abstruse.server.Close(); err != nil {
		abstruse.running <- err
	}

	abstruse.running <- nil
}

func (abstruse *Abstruse) init() error {
	config := config.ReadAndParseConfig(path.Join(abstruse.dir, "config.json"))

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

func (abstruse *Abstruse) wait() error {
	return <-abstruse.running
}
