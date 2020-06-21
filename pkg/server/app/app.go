package app

import (
	"strings"
	"sync"

	"github.com/jkuri/abstruse/pkg/server/db/repository"
	"github.com/jkuri/abstruse/pkg/server/options"
	"github.com/jkuri/abstruse/pkg/server/websocket"
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

	repo repository.Repo
}

// NewApp returns new instance of App.
func NewApp(opts *options.Options, ws *websocket.App, repo repository.Repo, log *zap.Logger) (*App, error) {
	app := &App{
		opts:    opts,
		workers: make(map[string]*Worker),
		ws:      ws,
		repo:    repo,
		log:     log,
		logger:  log.With(zap.String("type", "app")).Sugar(),
		errch:   make(chan error),
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
		app.scheduler = NewScheduler(app.client, app)
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

// GetCurrentJobLog returns current log for job which is still running.
func (app *App) GetCurrentJobLog(jobID uint) string {
	app.scheduler.mu.Lock()
	defer app.scheduler.mu.Unlock()
	if job, ok := app.scheduler.pending[jobID]; ok {
		return strings.Join(job.Log, "")
	}
	return ""
}
