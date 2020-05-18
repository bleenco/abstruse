package etcd

import (
	"time"

	"github.com/jkuri/abstruse/internal/worker/grpc"
	"go.etcd.io/etcd/clientv3"
	"go.uber.org/zap"
)

type App struct {
	opts       *Options
	client     *clientv3.Client
	grpcServer *grpc.Server
	logger     *zap.SugaredLogger
	donech     chan struct{}
}

func NewApp(opts *Options, logger *zap.Logger, grpcServer *grpc.Server) *App {
	log := logger.With(zap.String("type", "etcd-app")).Sugar()
	return &App{
		opts:       opts,
		grpcServer: grpcServer,
		logger:     log,
		donech:     make(chan struct{}),
	}
}

func (app *App) Start() error {
	app.logger.Infof("starting etcd app")
connect:
	client, err := NewClient(app.opts.ServerAddr)
	if err != nil {
		app.logger.Errorf(
			"connection to abstruse etcd server on %s failed, retrying...",
			app.opts.ServerAddr,
		)
		time.Sleep(time.Second * 5)
		goto connect
	}

	kch, err := register(client, app.grpcServer.Addr(), 5)
	if err != nil {
		app.logger.Errorf("failed to register on abstruse etcd server, retrying...")
		time.Sleep(time.Second * 5)
		goto connect
	}

	app.logger.Infof("connection to abstruse etcd server successful")
	for {
		select {
		case <-client.Ctx().Done():
			app.logger.Errorf("lost connection to abstruse etcd server %s, reconnecting...", app.opts.ServerAddr)
			goto connect
		case _, ok := <-kch:
			if !ok {
				app.logger.Errorf("lost connection to abstruse etcd server %s, reconnecting...", app.opts.ServerAddr)
				goto connect
			}
		case <-app.donech:
			unregister(client, app.grpcServer.Addr())
			return nil
		}
	}
}
