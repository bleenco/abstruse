package app

import (
	"context"

	"github.com/jkuri/abstruse/master/etcdserver"
	"github.com/jkuri/abstruse/master/rpc"
	"github.com/jkuri/abstruse/pkg/logger"
	"go.etcd.io/etcd/clientv3"
)

// App represents main master application instance.
type App struct {
	etcd    *etcdserver.EtcdServer
	workers map[string]*rpc.Client
	config  Config
	etcdcli *clientv3.Client
	log     *logger.Logger
	errch   chan error
}

// NewApp returns instance of main master application.
func NewApp(config Config) (*App, error) {
	log := logger.NewLogger("app", config.LogLevel)
	log.Infof("starting abstruse services...")
	etcd, err := etcdserver.NewEtcdServer(context.Background(), config.Etcd, logger.NewLogger("etcd", config.LogLevel))
	if err != nil {
		return nil, err
	}
	etcdcli := etcd.Client()

	return &App{
		etcd:    etcd,
		workers: make(map[string]*rpc.Client),
		etcdcli: etcdcli,
		config:  config,
		log:     log,
		errch:   make(chan error),
	}, nil
}

// Run starts master applicaton instance.
func (app *App) Run() error {
	go app.watchWorkers()

	return <-app.errch
}
