package core

import (
	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/worker/config"
	"github.com/bleenco/abstruse/worker/id"
	"go.etcd.io/etcd/clientv3"
	"go.uber.org/zap"
)

// App represents main worker application.
type App struct {
	cfg       *config.Config
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
func NewApp(cfg *config.Config, logger *zap.Logger) (*App, error) {
	id, err := id.GenerateID(cfg)
	if err != nil {
		return nil, err
	}
	app := &App{
		cfg:    cfg,
		addr:   lib.GetListenAddress(cfg.GRPC.ListenAddr),
		id:     id,
		log:    logger,
		logger: logger.Sugar(),
		errch:  make(chan error),
	}
	app.api = NewAPIServer(app)
	scheduler, err := newScheduler(id, cfg.Scheduler.MaxParallel, logger, app)
	if err != nil {
		return nil, err
	}
	app.scheduler = scheduler
	return app, nil
}

// Run starts worker application.
func (app *App) Run() error {
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
