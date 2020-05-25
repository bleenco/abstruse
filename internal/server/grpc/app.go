package grpc

import (
	"context"
	"path"
	"sync"

	"github.com/jkuri/abstruse/internal/pkg/shared"
	"github.com/jkuri/abstruse/internal/server/websocket"
	"go.etcd.io/etcd/clientv3"
	"go.uber.org/zap"
)

var capacityKeyPrefix = path.Join(shared.ServicePrefix, shared.WorkerCapacity)

// App represent main gRPC application and holds data
// for established worker connections.
type App struct {
	mu          sync.RWMutex
	opts        *Options
	workers     map[string]*Worker
	client      *clientv3.Client
	ws          *websocket.App
	logger      *zap.SugaredLogger
	Scheduler   *Scheduler
	WorkerReady chan *Worker
	errch       chan error
}

// NewApp returns new instance of App.
func NewApp(opts *Options, ws *websocket.App, logger *zap.Logger) (*App, error) {
	app := &App{
		opts:        opts,
		workers:     make(map[string]*Worker),
		ws:          ws,
		logger:      logger.With(zap.String("type", "grpc")).Sugar(),
		WorkerReady: make(chan *Worker),
		errch:       make(chan error),
	}
	app.Scheduler = NewScheduler(app, logger)

	return app, nil
}

// Start starts gRPC application.
func (app *App) Start(client *clientv3.Client) error {
	app.logger.Info("starting gRPC app")
	app.client = client

	go func() {
		if err := app.watchWorkers(); err != nil {
			app.errch <- err
		}
	}()

	go func() {
		if err := app.Scheduler.Start(app.client); err != nil {
			app.errch <- err
		}
	}()

	return <-app.errch
}

// GetWorkers returns online workers.
func (app *App) GetWorkers() map[string]*Worker {
	return app.workers
}

var i = 1

// StartJob temp func.
func (app *App) StartJob() bool {
	for i := 1; i <= 20; i++ {
		go func(i int) {
			// i++
			j := &shared.Job{ID: uint(i), Priority: 1000}
			app.Scheduler.ScheduleJob(j)
		}(i)
	}
	return true
}

func (app *App) initWorker(worker *Worker) {
	if err := worker.run(); err != nil {
		key := path.Join(shared.ServicePrefix, shared.WorkerService, worker.ID)
		app.client.Delete(context.TODO(), key)
		worker.EmitDeleted()
		delete(app.workers, worker.ID)
	}
}

func (app *App) getWorkersCapacityData() (int32, int32) {
	app.mu.Lock()
	defer app.mu.Unlock()
	var max, running int32
	for _, worker := range app.workers {
		if worker.ready {
			max += worker.Max
			running += worker.Running
		}
	}
	return max, running
}
