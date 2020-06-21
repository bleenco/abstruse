package app

import (
	"context"
	"path"

	"github.com/jkuri/abstruse/pkg/core"
	"go.etcd.io/etcd/clientv3"
	"go.etcd.io/etcd/mvcc/mvccpb"
)

func (app *App) watchWorkers() error {
	prefix := path.Clean(core.WorkerService)

	resp, err := app.client.Get(context.Background(), prefix, clientv3.WithPrefix())
	if err != nil {
		app.logger.Errorf("%v", err)
	} else {
		for i := range resp.Kvs {
			id, addr := path.Base(string(resp.Kvs[i].Key)), string(resp.Kvs[i].Value)
			worker, err := newWorker(addr, id, app.opts, app.logger, app)
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
					worker, err := newWorker(addr, id, app.opts, app.logger, app)
					if err != nil {
						return err
					}
					app.workers[id] = worker
					go app.initWorker(worker)
				}
			case mvccpb.DELETE:
				id := path.Base(string(ev.Kv.Key))
				if worker, ok := app.workers[id]; ok {
					app.ws.Broadcast("/subs/workers_delete", map[string]interface{}{
						"id": worker.ID(),
					})
					app.mu.Lock()
					delete(app.workers, id)
					app.mu.Unlock()
					app.scheduler.DeleteWorker(id)
				}
			}
		}
	}
	return nil
}

func (app *App) initWorker(w *Worker) {
	if err := w.Run(); err != nil {
		key := path.Clean(path.Join(core.WorkerService, w.id))
		app.client.Delete(context.TODO(), key)
	}
}
