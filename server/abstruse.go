package server

import (
	"log"
	"net/http"

	"github.com/bleenco/abstruse/db"
	humanize "github.com/dustin/go-humanize"
	"github.com/felixge/httpsnoop"

	"github.com/bleenco/abstruse/config"
	"github.com/bleenco/abstruse/fs"
	"github.com/bleenco/abstruse/logger"

	"golang.org/x/net/http2"
)

// AbstruseConfig defines configuration of the main master server.
type AbstruseConfig struct {
	HTTPAddress  string
	HTTPSAddress string
	CertFile     string
	KeyFile      string
	Dir          string
	Debug        bool
}

// Abstruse represents main master server.
type Abstruse struct {
	config *AbstruseConfig
	router *Router
	server *http.Server
	logger *logger.Logger
	dir    string

	running chan error
}

// NewAbstruse creates a new main master server instance.
func NewAbstruse(c *AbstruseConfig) (*Abstruse, error) {
	log := logger.NewLogger("", true, c.Debug)

	dir := c.Dir
	if dir == "" {
		dir, _ = fs.GetHomeDir()
		dir = dir + "/abstruse"
	}

	if c.CertFile == "" || c.KeyFile == "" {
		cfg := config.ReadAndParseConfig(dir + "/config.json")
		c.CertFile = cfg.Security.Cert
		c.KeyFile = cfg.Security.CertKey
	}

	return &Abstruse{
		config:  c,
		router:  NewRouter(),
		server:  &http.Server{},
		logger:  log,
		dir:     dir,
		running: make(chan error, 1),
	}, nil
}

// Run starts the main server instance.
func (a *Abstruse) Run() error {
	if err := a.init(); err != nil {
		return err
	}

	handler := http.HandlerFunc(func(res http.ResponseWriter, req *http.Request) {
		m := httpsnoop.CaptureMetrics(a.router, res, req)
		a.logger.Infof(
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
			a.logger.Infof("http listening on %s", a.config.HTTPAddress)
			log.Fatal(http.ListenAndServe(a.config.HTTPAddress, handler))
		}()
	}

	if a.config.HTTPSAddress != "" && a.config.CertFile != "" && a.config.KeyFile != "" {
		go func() {
			a.server.Addr = a.config.HTTPSAddress
			a.server.Handler = handler
			http2.ConfigureServer(a.server, nil)

			a.logger.Infof("https listening on %s", a.config.HTTPSAddress)
			log.Fatal(a.server.ListenAndServeTLS(a.config.CertFile, a.config.KeyFile))
		}()
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
