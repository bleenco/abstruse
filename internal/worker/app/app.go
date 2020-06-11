package app

import (
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
	ready     chan struct{}
}

// NewApp returns new instance of an App.
func NewApp(opts *options.Options, logger *zap.Logger) (*App, error) {
	id, err := id.GenerateID(opts)
	if err != nil {
		return nil, err
	}
	app := &App{
		opts:   opts,
		addr:   util.GetListenAddress(opts.GRPC.ListenAddr),
		id:     id,
		logger: logger,
		ready:  make(chan struct{}, 1),
	}
	app.api = NewAPIServer(app)
	scheduler, err := newScheduler(id, opts.Scheduler.MaxConcurrency, logger, app)
	if err != nil {
		return nil, err
	}
	app.scheduler = scheduler
	return app, nil
}

// Start starts worker application.
func (app *App) Start() error {
	errch := make(chan error)

	go func() {
		if err := app.api.Start(); err != nil {
			errch <- err
		}
	}()

	go func() {
		if err := app.connect(); err != nil {
			errch <- err
		}
	}()

	go func() {
		for {
			<-app.ready
			if err := app.scheduler.run(); err != nil {
				errch <- err
			}
		}
	}()

	return <-errch
}
