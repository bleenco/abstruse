package grpc

import (
	"context"
	"path"
	"sync"

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
func NewApp(opts *Options, ws *websocket.App, client *clientv3.Client, logger *zap.Logger) (*App, error) {
	app := &App{
		config:  config,
		workers: make(map[string]*Worker),
		client:  client,
		ws:      ws,
		logger:  logger.With(zap.String("type", "grpc")).Sugar(),
		errch:   make(chan error),
	}
}

// Start starts gRPC application.
func (app *App) Start() error {
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
	prefix := path.Join(etcdutil.ServicePrefix, etcdutil.WorkerService)

	resp, err := app.etcdcli.Get(context.Background(), prefix, clientv3.WithPrefix())
	if err != nil {
		app.log.Errorf("%v", err)
	} else {
		for i := range resp.Kvs {
			key, val := string(resp.Kvs[i].Key), string(resp.Kvs[i].Value)
			worker, err := newWorker(val, app.config, app.log)
			if err != nil {
				app.log.Errorf("%v", err)
			} else {
				app.workers[key] = worker
				go app.initWorker(worker)
			}
		}
	}

	rch := app.etcdcli.Watch(context.Background(), prefix, clientv3.WithPrefix())
	for n := range rch {
		for _, ev := range n.Events {
			switch ev.Type {
			case mvccpb.PUT:
				worker, err := newWorker(string(ev.Kv.Value), app.config, app.log)
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
		etcdcli := etcdserver.ETCDServer.Client()
		key := path.Join(etcdutil.ServicePrefix, etcdutil.WorkerService, worker.GetAddr())
		etcdcli.Delete(context.Background(), key)
		app.log.Errorf("%s", err.Error())
	}
}
