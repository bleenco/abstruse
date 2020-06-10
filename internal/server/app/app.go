package app

import (
	"sync"

	"github.com/jkuri/abstruse/internal/server/db/repository"
	"github.com/jkuri/abstruse/internal/server/options"
	"github.com/jkuri/abstruse/internal/server/websocket"
	"go.etcd.io/etcd/clientv3"
	"go.uber.org/zap"
)

// App represent main gRPC application and holds data
// for established worker connections.
type App struct {
	mu        sync.RWMutex
	opts      *options.Options
	workers   map[string]*Worker
	client    *clientv3.Client
	ws        *websocket.App
	log       *zap.Logger
	logger    *zap.SugaredLogger
	scheduler Scheduler
	errch     chan error

	buildRepository repository.BuildRepository
	jobRepository   repository.JobRepository
	repoRepository  repository.RepoRepository
}

// NewApp returns new instance of App.
func NewApp(opts *options.Options, ws *websocket.App, rr repository.RepoRepository, jr repository.JobRepository, br repository.BuildRepository, log *zap.Logger) (*App, error) {
	app := &App{
		opts:            opts,
		workers:         make(map[string]*Worker),
		ws:              ws,
		buildRepository: br,
		jobRepository:   jr,
		repoRepository:  rr,
		log:             log,
		logger:          log.With(zap.String("type", "app")).Sugar(),
		errch:           make(chan error),
	}

	return app, nil
}

// Start starts gRPC application.
func (app *App) Start(client *clientv3.Client) error {
	app.client = client

	go func() {
		if err := app.watchWorkers(); err != nil {
			app.errch <- err
		}
	}()

	go func() {
		app.scheduler = NewScheduler(app.client, app.log)
		if err := app.scheduler.Start(); err != nil {
			app.errch <- err
		}
	}()

	return <-app.errch
}

// GetWorkers returns workers list.
func (app *App) GetWorkers() map[string]*Worker {
	app.mu.Lock()
	defer app.mu.Unlock()
	return app.workers
}
