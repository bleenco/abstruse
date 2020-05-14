package app

import (
	"context"
	"time"

	"github.com/jkuri/abstruse/master/websocket"

	"github.com/jkuri/abstruse/master/etcdserver"
	"github.com/jkuri/abstruse/master/httpserver"
	"github.com/jkuri/abstruse/master/rpc"
	"github.com/jkuri/abstruse/pkg/logger"
	"github.com/jkuri/abstruse/pkg/security"
	"go.etcd.io/etcd/clientv3"
)

// App represents main master application instance.
type App struct {
	http    *httpserver.Server
	etcd    *etcdserver.EtcdServer
	ws      *websocket.Server
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
	security.InitSecurity(config.JWTSecret)

	etcd, err := etcdserver.NewEtcdServer(context.Background(), config.Etcd, logger.NewLogger("etcd", config.LogLevel))
	if err != nil {
		return nil, err
	}
	etcdcli := etcd.Client()

	httpsrv, err := httpserver.NewServer(config.HTTP, config.LogLevel)
	if err != nil {
		return nil, err
	}
	ws := websocket.NewServer("0.0.0.0:7100", time.Millisecond*100, config.LogLevel)

	return &App{
		http:    httpsrv,
		etcd:    etcd,
		ws:      ws,
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

	go func() {
		if err := app.ws.Run(); err != nil {
			app.errch <- err
		}
	}()

	go app.watchWorkers()

	return <-app.errch
}
