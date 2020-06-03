package app

import (
	"context"
	"path"
	"sync"

	"github.com/jkuri/abstruse/internal/pkg/shared"
	"github.com/jkuri/abstruse/internal/server/db/repository"
	"github.com/jkuri/abstruse/internal/server/websocket"
	"go.etcd.io/etcd/clientv3"
	"go.uber.org/zap"
)

// App represent main gRPC application and holds data
// for established worker connections.
type App struct {
	mu        sync.RWMutex
	opts      *Options
	workers   map[string]*Worker
	client    *clientv3.Client
	ws        *websocket.App
	logger    *zap.SugaredLogger
	Scheduler *Scheduler
	errch     chan error

	buildRepository repository.BuildRepository
	jobRepository   repository.JobRepository
	repoRepository  repository.RepoRepository
}

// NewApp returns new instance of App.
func NewApp(
	opts *Options,
	ws *websocket.App,
	rr repository.RepoRepository,
	jr repository.JobRepository,
	br repository.BuildRepository,
	logger *zap.Logger,
) (*App, error) {
	app := &App{
		opts:            opts,
		workers:         make(map[string]*Worker),
		ws:              ws,
		buildRepository: br,
		jobRepository:   jr,
		repoRepository:  rr,
		logger:          logger.With(zap.String("type", "app")).Sugar(),
		errch:           make(chan error),
	}
	app.Scheduler = NewScheduler(app, logger)

	return app, nil
}

// Start starts gRPC application.
func (app *App) Start(client *clientv3.Client) error {
	app.logger.Debugf("starting app")
	app.client = client

	go func() {
		if err := app.watchWorkers(); err != nil {
			app.errch <- err
		}
	}()

	go app.Scheduler.Start(app.client)

	return <-app.errch
}

// GetWorkers returns online workers.
func (app *App) GetWorkers() map[string]*Worker {
	return app.workers
}

func (app *App) initWorker(worker *Worker) {
	if err := worker.run(); err != nil {
		key := path.Join(shared.ServicePrefix, shared.WorkerService, worker.ID)
		app.client.Delete(context.TODO(), key)
	}
}

func (app *App) getCapacity() (int32, int32) {
	var max, running int32
	app.mu.Lock()
	defer app.mu.Unlock()
	for _, w := range app.workers {
		max += w.Max
		running += w.Running
	}
	return max, running
}
