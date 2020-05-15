package rpc

import (
	"context"
	"path"
	"sync"

	"github.com/jkuri/abstruse/master/etcdserver"
	"github.com/jkuri/abstruse/pkg/etcdutil"
	"github.com/jkuri/abstruse/pkg/logger"
	"go.etcd.io/etcd/clientv3"
	"go.etcd.io/etcd/mvcc/mvccpb"
)

// RPCApp exported main instance of gRPC application.
var RPCApp *App

// App represent main gRPC application and holds data
// for established worker connections.
type App struct {
	mu      sync.RWMutex
	config  Config
	workers map[string]*Worker
	etcdcli *clientv3.Client
	log     *logger.Logger
	errch   chan error
}

// Config defines gRPC client configuration.
type Config struct {
	Cert string `json:"cert"`
	Key  string `json:"key"`
}

// RunApp starts gRPC application.
func RunApp(config Config, cli *clientv3.Client, logLevel string) error {
	app := &App{
		config:  config,
		workers: make(map[string]*Worker),
		etcdcli: cli,
		log:     logger.NewLogger("grpc", logLevel),
		errch:   make(chan error),
	}
	RPCApp = app

	go func() {
		if err := app.watchWorkers(); err != nil {
			RPCApp.errch <- err
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
			client, err := newWorker(val, app.config, app.log)
			if err != nil {
				app.log.Errorf("%v", err)
			} else {
				app.workers[key] = client
				go app.initWorker(client)
			}
		}
	}

	rch := app.etcdcli.Watch(context.Background(), prefix, clientv3.WithPrefix())
	for n := range rch {
		for _, ev := range n.Events {
			switch ev.Type {
			case mvccpb.PUT:
				client, err := newWorker(string(ev.Kv.Value), app.config, app.log)
				if err != nil {
					return err
				}
				app.workers[string(ev.Kv.Key)] = client
				go app.initWorker(client)
			case mvccpb.DELETE:
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
