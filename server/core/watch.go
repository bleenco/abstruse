package core

import (
	"context"
	"path"

	"github.com/bleenco/abstruse/internal/common"
	"go.etcd.io/etcd/clientv3"
	"go.etcd.io/etcd/mvcc/mvccpb"
)

func (app *App) watchWorkers() error {
	prefix := path.Clean(common.WorkerService)

	resp, err := app.client.Get(context.Background(), prefix, clientv3.WithPrefix())
	if err != nil {
		app.logger.Errorf("%v", err)
	} else {
		for i := range resp.Kvs {
			id, addr := path.Base(string(resp.Kvs[i].Key)), string(resp.Kvs[i].Value)
			worker, err := NewWorker(id, addr, app.cfg, Log, app)
			if err != nil {
				app.logger.Errorf("%v", err)
			} else {
				app.scheduler.mu.Lock()
				app.scheduler.workers[id] = worker
				app.scheduler.mu.Unlock()
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
				if _, ok := app.scheduler.workers[id]; !ok {
					worker, err := NewWorker(id, addr, app.cfg, Log, app)
					if err != nil {
						return err
					}
					app.scheduler.mu.Lock()
					app.scheduler.workers[id] = worker
					app.scheduler.mu.Unlock()
					go app.initWorker(worker)
				}
			case mvccpb.DELETE:
				id := path.Base(string(ev.Kv.Key))
				if worker, ok := app.scheduler.workers[id]; ok {
					app.ws.App.Broadcast("/subs/workers_delete", map[string]interface{}{
						"id": worker.ID(),
					})
					app.scheduler.mu.Lock()
					delete(app.scheduler.workers, id)
					app.scheduler.mu.Unlock()
				}
			}
		}
	}
	return nil
}

func (app *App) initWorker(w *Worker) {
	if err := w.Run(); err != nil {
		key := path.Clean(path.Join(common.WorkerService, w.id))
		app.client.Delete(context.TODO(), key)
	}
}
