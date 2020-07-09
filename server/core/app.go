package core

import (
	"github.com/bleenco/abstruse/pkg/etcd/embed"
	"github.com/bleenco/abstruse/server/config"
	"go.etcd.io/etcd/clientv3"
	"go.uber.org/zap"
)

// App represents main server application which handles all the services.
type App struct {
	cfg    *config.Config
	logger *zap.SugaredLogger
	etcd   *embed.Server
	cli    *clientv3.Client
	stopch chan struct{}
}

// NewApp returns new instance of main application.
func NewApp() *App {
	logger := Log.With(zap.String("type", "app")).Sugar()
	etcd := embed.NewServer(Config, Log)

	return &App{
		cfg:    Config,
		logger: logger,
		etcd:   etcd,
		stopch: make(chan struct{}),
	}
}

// Run starts the main application with all services.
func (a *App) Run() error {
	errch := make(chan error)

	go func() {
		if err := a.etcd.Run(); err != nil {
			errch <- err
		}
		cli, err := a.etcd.GetClient()
		if err != nil {
			errch <- err
		}
		a.cli = cli
	}()

	select {
	case err := <-errch:
		return err
	case <-a.stopch:
		return nil
	}
}

// Stop stops the application.
func (a *App) Stop() {
	a.stopch <- struct{}{}
}
