package app

import (
	"context"

	"github.com/jkuri/abstruse/master/etcdserver"
	"github.com/jkuri/abstruse/master/httpserver"
	"github.com/jkuri/abstruse/master/rpc"
	"github.com/jkuri/abstruse/pkg/logger"
	"go.etcd.io/etcd/clientv3"
)

// App represents main master application instance.
type App struct {
	http    *httpserver.Server
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

	httpsrv, err := httpserver.NewServer(config.HTTP, config.LogLevel)
	if err != nil {
		return nil, err
	}

	return &App{
		http:    httpsrv,
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
	go func() {
		if err := app.http.Run(); err != nil {
			app.errch <- err
		}
	}()

	go app.watchWorkers()

	return <-app.errch
}
