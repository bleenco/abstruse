package core

import (
	"context"

	"github.com/jkuri/abstruse/pkg/config"
	"github.com/jkuri/abstruse/pkg/etcdserver"
)

// App represents main master application instance.
type App struct {
	Config config.AppConfig
	Etcd   *etcdserver.EtcdServer
	done   chan struct{}
}

func NewApp(cfg config.AppConfig) (*App, error) {
	etcd, err := etcdserver.NewEtcdServer(context.Background(), cfg.Etcd)
	if err != nil {
		return nil, err
	}

	return &App{
		Config: cfg,
		Etcd:   etcd,
		done:   make(chan struct{}),
	}, nil
}

func (app *App) Wait() {
	<-app.done
}
