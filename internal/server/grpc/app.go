package grpc

import (
	"context"
	"path"
	"sync"

	"github.com/jkuri/abstruse/internal/pkg/shared"
	"github.com/jkuri/abstruse/internal/server/websocket"
	"go.etcd.io/etcd/clientv3"
	"go.etcd.io/etcd/mvcc/mvccpb"
	"go.uber.org/zap"
)

// App represent main gRPC application and holds data
// for established worker connections.
type App struct {
	mu      sync.RWMutex
	opts    *Options
	workers map[string]*Worker
	client  *clientv3.Client
	ws      *websocket.App
	logger  *zap.SugaredLogger
	errch   chan error
}

// NewApp returns new instance of App.
func NewApp(opts *Options, ws *websocket.App, logger *zap.Logger) (*App, error) {
	app := &App{
		opts:    opts,
		workers: make(map[string]*Worker),
		ws:      ws,
		logger:  logger.With(zap.String("type", "grpc")).Sugar(),
		errch:   make(chan error),
	}

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

	return <-app.errch
}

// GetWorkers returns online workers.
func (app *App) GetWorkers() map[string]*Worker {
	return app.workers
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

func (app *App) initWorker(worker *Worker) {
	if err := worker.run(); err != nil {
		// immediately remove worker from etcd.
		key := path.Join(shared.ServicePrefix, shared.WorkerService, worker.GetAddr())
		app.client.Delete(context.Background(), key)
		app.logger.Errorf("%s", err.Error())
	}
}
