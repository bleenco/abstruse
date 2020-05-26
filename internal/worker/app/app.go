package app

import (
	"github.com/google/wire"
	"github.com/jkuri/abstruse/internal/pkg/util"
	"github.com/jkuri/abstruse/internal/worker/id"
	"github.com/jkuri/abstruse/internal/worker/options"
	"go.etcd.io/etcd/clientv3"
	"go.uber.org/zap"
)

// App represents main worker application.
type App struct {
	opts      *options.Options
	id        string
	addr      string
	api       *APIServer
	scheduler *scheduler
	client    *clientv3.Client
	logger    *zap.Logger
	errch     chan error
}

// NewApp returns new instance of an App.
func NewApp(opts *options.Options, logger *zap.Logger) *App {
	id, _ := id.GenerateID(opts)
	app := &App{
		opts:   opts,
		addr:   util.GetListenAddress(opts.GRPC.ListenAddr),
		id:     id,
		logger: logger,
		errch:  make(chan error),
	}
	app.api = NewAPIServer(app)
	app.scheduler = newScheduler(int32(opts.Scheduler.MaxConcurrency), app, logger)
	return app
}

// Start starts worker application.
func (app *App) Start() error {
	app.logger.Sugar().Infof("starting worker...")

	go func() {
		if err := app.api.Start(); err != nil {
			app.errch <- err
		}
	}()

	go func() {
		if err := app.connect(); err != nil {
			app.errch <- err
		}
	}()

	go app.scheduler.run()

	return <-app.errch
}

// ProviderSet exports for wire dependency injection.
var ProviderSet = wire.NewSet(NewApp)
