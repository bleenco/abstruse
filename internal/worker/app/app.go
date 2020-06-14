package app

import (
	"github.com/jkuri/abstruse/internal/pkg/auth"
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
	log       *zap.Logger
	logger    *zap.SugaredLogger
	errch     chan error
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
		log:    logger,
		logger: logger.Sugar(),
		errch:  make(chan error),
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
	if err := app.init(); err != nil {
		return err
	}
	errch := make(chan error)

	go func() {
		if err := app.api.Start(); err != nil {
			errch <- err
		}
	}()

	go func() {
		for {
			app.connectLoop()
			go app.scheduler.run()
			<-app.errch
			app.scheduler.stop()
		}
	}()

	return <-errch
}

func (app *App) init() error {
	err := auth.InitAuth(app.opts.Auth)
	return err
}
