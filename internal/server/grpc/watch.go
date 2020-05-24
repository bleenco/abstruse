package grpc

import (
	"context"
	"path"

	"github.com/jkuri/abstruse/internal/pkg/shared"
	jsoniter "github.com/json-iterator/go"
	"go.etcd.io/etcd/clientv3"
	"go.etcd.io/etcd/mvcc/mvccpb"
)

func (app *App) watchWorkers() error {
	prefix := path.Join(shared.ServicePrefix, shared.WorkerService)

	resp, err := app.client.Get(context.Background(), prefix, clientv3.WithPrefix())
	if err != nil {
		app.logger.Errorf("%v", err)
	} else {
		for i := range resp.Kvs {
			id, addr := path.Base(string(resp.Kvs[i].Key)), string(resp.Kvs[i].Value)
			worker, err := newWorker(addr, id, app.opts, app.ws, app.logger)
			if err != nil {
				app.logger.Errorf("%v", err)
			} else {
				app.workers[id] = worker
				go app.initWorker(worker)
			}
		}
	}

	rch := app.client.Watch(context.Background(), prefix, clientv3.WithPrefix())
	for n := range rch {
		for _, ev := range n.Events {
			switch ev.Type {
			case mvccpb.PUT:
				id, addr := path.Base(string(ev.Kv.Key)), string(ev.Kv.Value)
				if _, ok := app.workers[id]; !ok {
					worker, err := newWorker(addr, id, app.opts, app.ws, app.logger)
					if err != nil {
						return err
					}
					app.workers[id] = worker
					go app.initWorker(worker)
				}
			case mvccpb.DELETE:
				id := path.Base(string(ev.Kv.Key))
				if worker, ok := app.workers[id]; ok {
					worker.EmitDeleted()
					delete(app.workers, id)
				}
			}
		}
	}
	return nil
}

func (app *App) watchConcurrency() error {
	prefix := path.Join(shared.ServicePrefix, "concurrency")

	resp, err := app.client.Get(context.Background(), prefix, clientv3.WithPrefix())
	if err != nil {
		app.logger.Errorf("%v", err)
	} else {
		for i := range resp.Kvs {
			var c Concurrency
			id, data := path.Base(string(resp.Kvs[i].Key)), resp.Kvs[i].Value
			if err := jsoniter.Unmarshal(data, &c); err != nil {
				continue
			}
			if worker, ok := app.workers[id]; ok {
				worker.updateConcurrency(c)
				if c.Free > 0 {
					app.WorkerReady <- worker
				}
			}
		}
	}

	rch := app.client.Watch(context.Background(), prefix, clientv3.WithPrefix())
	for n := range rch {
		for _, ev := range n.Events {
			switch ev.Type {
			case mvccpb.PUT:
				var c Concurrency
				id, data := path.Base(string(ev.Kv.Key)), ev.Kv.Value
				if err := jsoniter.Unmarshal(data, &c); err != nil {
					continue
				}
				if worker, ok := app.workers[id]; ok {
					worker.updateConcurrency(c)
					if c.Free > 0 {
						app.WorkerReady <- worker
					}
				}
			}
		}
	}

	return nil
}
