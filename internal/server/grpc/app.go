package grpc

import (
	"context"
	"fmt"
	"path"
	"sync"

	"github.com/jkuri/abstruse/internal/pkg/shared"
	"github.com/jkuri/abstruse/internal/server/scheduler"
	"github.com/jkuri/abstruse/internal/server/websocket"
	"go.etcd.io/etcd/clientv3"
	"go.etcd.io/etcd/mvcc/mvccpb"
	"go.uber.org/zap"
)

var capacityKeyPrefix = path.Join(shared.ServicePrefix, shared.WorkerCapacity)

// App represent main gRPC application and holds data
// for established worker connections.
type App struct {
	mu        sync.RWMutex
	opts      *Options
	workers   map[string]*Worker
	client    *clientv3.Client
	ws        *websocket.App
	scheduler *scheduler.Scheduler
	logger    *zap.SugaredLogger
	errch     chan error
	ready     chan struct{}
}

// NewApp returns new instance of App.
func NewApp(opts *Options, ws *websocket.App, logger *zap.Logger) (*App, error) {
	app := &App{
		opts:    opts,
		workers: make(map[string]*Worker),
		ws:      ws,
		logger:  logger.With(zap.String("type", "grpc")).Sugar(),
		errch:   make(chan error),
		ready:   make(chan struct{}),
	}

	return app, nil
}

// Start starts gRPC application.
func (app *App) Start(client *clientv3.Client) error {
	app.logger.Info("starting gRPC app")
	app.client = client
	app.scheduler = scheduler.NewScheduler(client, app.logger.Desugar())

	go func() {
		if err := app.watchWorkers(); err != nil {
			app.errch <- err
		}
	}()

	go app.watchCapacity()
	go app.schedulerLoop()

	return <-app.errch
}

// GetWorkers returns online workers.
func (app *App) GetWorkers() map[string]*Worker {
	return app.workers
}

// StartJob temp func.
func (app *App) StartJob() bool {
	for i := 0; i < 100; i++ {
		job := &scheduler.Job{ID: uint64(i), URL: "https://github.com/jkuri/abstruse"}
		if err := app.scheduler.Schedule(job, 1000); err != nil {
			return false
		}
	}
	return true
}

func (app *App) schedulerLoop() error {
	for {
		job, err := app.scheduler.Next()
		if err != nil {
			return err
		}
		w := app.getWorker()
		go func() {
			status, _ := w.StartJob(context.TODO(), job.ID)
			fmt.Printf("%+v\n", status)
			select {
			case app.ready <- struct{}{}:
			default:
			}
		}()
	}
}

func (app *App) getWorker() *Worker {
loop:
	var w *Worker
	for _, worker := range app.workers {
		stats, err := worker.Concurrency(context.Background())
		if err != nil {
			continue
		}
		free := stats.GetMax() - stats.GetCurrent()
		if free > 0 {
			if w == nil {
				w = worker
			}
			if w.max-w.current < free {
				w = worker
			}
		}
	}
	if w == nil {
		<-app.ready
		goto loop
	}
	return w
}

func (app *App) watchWorkers() error {
	defer app.client.Close()
	prefix := path.Join(shared.ServicePrefix, shared.WorkerService)

	resp, err := app.client.Get(context.Background(), prefix, clientv3.WithPrefix())
	if err != nil {
		app.logger.Errorf("%v", err)
	} else {
		for i := range resp.Kvs {
			key, val := string(resp.Kvs[i].Key), string(resp.Kvs[i].Value)
			worker, err := newWorker(val, app.opts, app.ws, app.logger)
			if err != nil {
				app.logger.Errorf("%v", err)
			} else {
				app.workers[key] = worker
				go app.initWorker(worker)
			}
		}
	}

	rch := app.client.Watch(context.Background(), prefix, clientv3.WithPrefix())
	for n := range rch {
		for _, ev := range n.Events {
			switch ev.Type {
			case mvccpb.PUT:
				worker, err := newWorker(string(ev.Kv.Value), app.opts, app.ws, app.logger)
				if err != nil {
					return err
				}
				app.workers[string(ev.Kv.Key)] = worker
				go app.initWorker(worker)
			case mvccpb.DELETE:
				app.workers[string(ev.Kv.Key)].EmitDeleted()
				delete(app.workers, string(ev.Kv.Key))
			}
		}
	}
	return nil
}

func (app *App) watchCapacity() error {
	prefix := path.Join(shared.ServicePrefix, shared.WorkerCapacity)
	rch := app.client.Watch(context.Background(), prefix, clientv3.WithPrefix())
	for n := range rch {
		for _, ev := range n.Events {
			if ev.Type == mvccpb.PUT {
				select {
				case app.ready <- struct{}{}:
				default:
				}
			}
		}
	}
	return nil
}

func (app *App) initWorker(worker *Worker) {
	select {
	case app.ready <- struct{}{}:
	default:
	}

	if err := worker.run(); err != nil {
		key := path.Join(shared.ServicePrefix, shared.WorkerService, worker.GetAddr())
		app.client.Delete(context.TODO(), key)
	}
}
