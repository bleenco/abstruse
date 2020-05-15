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

	conn := func() (*clientv3.Client, <-chan *clientv3.LeaseKeepAliveResponse, error) {
		cli, err := etcdutil.NewClient(app.config.ServerAddr)
		if err != nil {
			log.Infof("connection to abstruse etcd server %s failed, will retry...", app.config.ServerAddr)
			return nil, nil, err
		}

		kch, err := etcdutil.Register(cli, app.config.GRPC.ListenAddr, 5, log)
		if err != nil {
			return nil, nil, err
		}
		return cli, kch, nil
	}

retry:
	dch := make(chan struct{})
	ticker := backoff.NewTicker(backoff.NewExponentialBackOff())
	for range ticker.C {
		cli, kch, err := conn()
		if err != nil {
			continue
		}
		log.Infof("connected to abstruse etcd server %s", app.config.ServerAddr)

		go func() {
			for {
				select {
				case <-cli.Ctx().Done():
					dch <- struct{}{}
					log.Infof("lost connection to abstruse etcd server %s", app.config.ServerAddr)
					return
				case _, ok := <-kch:
					if !ok {
						dch <- struct{}{}
						log.Infof("lost connection to abstruse etcd server %s", app.config.ServerAddr)
						return
					}
				}
			}
		}()

		ticker.Stop()
		break
	}

	for {
		<-dch
		goto retry
	}
}
