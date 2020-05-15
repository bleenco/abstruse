package app

import (
	"github.com/cenkalti/backoff/v4"
	"github.com/jkuri/abstruse/pkg/etcdutil"
	"github.com/jkuri/abstruse/pkg/logger"
	"github.com/jkuri/abstruse/worker/rpc"
	"go.etcd.io/etcd/clientv3"
)

// App defines main worker application.
type App struct {
	Server *rpc.Server

	config Config
	errch  chan error
}

// NewApp returns main worker app instance.
func NewApp(config Config) (*App, error) {
	grpcServer, err := rpc.NewServer(config.GRPC, logger.NewLogger("grpc", config.LogLevel))
	if err != nil {
		return nil, err
	}

	return &App{
		Server: grpcServer,
		config: config,
		errch:  make(chan error),
	}, nil
}

// Run starts main worker app.
func (app *App) Run() error {
	go func() {
		if err := app.Server.Listen(); err != nil {
			app.errch <- err
		}
	}()

	go app.etcdConnLoop()

	return <-app.errch
}

func (app *App) etcdConnLoop() {
	log := logger.NewLogger("etcd", app.config.LogLevel)

	conn := func() (<-chan *clientv3.LeaseKeepAliveResponse, error) {
		kch, err := etcdutil.Register(app.config.ServerAddr, app.config.GRPC.ListenAddr, 5, log)
		if err != nil {
			log.Infof("connection to abstruse etcd server %s failed, will retry...", app.config.ServerAddr)
			return nil, err
		}
		return kch, nil
	}

retry:
	dch := make(chan struct{})
	ticker := backoff.NewTicker(backoff.NewExponentialBackOff())
	for range ticker.C {
		kch, err := conn()
		if err != nil {
			continue
		}
		ticker.Stop()
		log.Infof("connected to abstruse etcd server %s", app.config.ServerAddr)

		go func() {
			for {
				_, ok := <-kch
				if !ok {
					dch <- struct{}{}
					log.Infof("lost connection to abstruse etcd server %s", app.config.ServerAddr)
					return
				}
			}
		}()

		break
	}

	for {
		<-dch
		goto retry
	}
}
