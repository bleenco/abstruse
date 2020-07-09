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
	client *clientv3.Client
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
	var err error
	errch := make(chan error)

	a.client, err = a.startEtcd()
	if err != nil {
		errch <- err
	}

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

// RestartEtcd restarts etcd server.
func (a *App) RestartEtcd() error {
	var err error
	a.etcd.Stop()
	a.etcd = embed.NewServer(Config, Log)
	a.client, err = a.startEtcd()

	return err
}

// SaveConfig saves new configuration.
func (a *App) SaveConfig(cfg *config.Config) error {
	return saveConfig(cfg)
}

// SaveEtcdConfig saves new etcd configuration.
func (a *App) SaveEtcdConfig(cfg *config.Etcd) error {
	return saveEtcdConfig(cfg)
}

func (a *App) startEtcd() (*clientv3.Client, error) {
	if err := a.etcd.Run(); err != nil {
		return nil, err
	}

	return a.etcd.GetClient()
}
