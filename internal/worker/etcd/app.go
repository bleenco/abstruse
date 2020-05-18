package etcd

import (
	"time"

	"github.com/jkuri/abstruse/internal/worker/grpc"
	"go.etcd.io/etcd/clientv3"
	"go.uber.org/zap"
)

// App defines remote worker's etcd service.
type App struct {
	opts       *Options
	client     *clientv3.Client
	grpcServer *grpc.Server
	logger     *zap.SugaredLogger
	donech     chan struct{}
}

// NewApp returns new instance of App.
func NewApp(opts *Options, logger *zap.Logger, grpcServer *grpc.Server) *App {
	log := logger.With(zap.String("type", "etcd-app")).Sugar()
	return &App{
		opts:       opts,
		grpcServer: grpcServer,
		logger:     log,
		donech:     make(chan struct{}),
	}
}

// Start starts etcd service.
func (app *App) Start() error {
	app.logger.Infof("starting etcd app")
	errch := make(chan error)

connect:
	client, err := NewClient(app.opts.ServerAddr)
	if err != nil {
		app.logger.Errorf(
			"%s %v, reconnecting...",
			app.opts.ServerAddr,
			err,
		)
		time.Sleep(time.Second * 5)
		goto connect
	}

	reg := newRegisterService(client, app.grpcServer.Addr(), 5, app.logger)

	go func() {
		for {
			err := <-errch
			app.logger.Errorf("%v, reconnecting...", err)
			reg.stop()
		}
	}()

	if err := reg.register(); err != nil {
		errch <- err
		goto connect
	}

	return nil
}
