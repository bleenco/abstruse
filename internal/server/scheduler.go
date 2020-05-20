package server

import (
	"context"
	"fmt"
	"path"
	"time"

	"go.etcd.io/etcd/clientv3"
	"go.etcd.io/etcd/mvcc/mvccpb"

	"github.com/jkuri/abstruse/internal/pkg/shared"
	"github.com/jkuri/abstruse/internal/server/grpc"
	jsoniter "github.com/json-iterator/go"
	recipe "go.etcd.io/etcd/contrib/recipes"
)

type capacity struct {
	Current int `json:"current"`
	Max     int `json:"max"`
}

type worker struct {
	w    *grpc.Worker
	free int
}

func (app *App) scheduleJobs() {
	for i := 0; i < 50; i++ {
		id := uint64(i) + 1
		worker, err := app.waitForWorker()
		if err != nil {
			app.logger.Errorf("%v", err)
			continue
		}
		app.logger.Debugf("sending job %d to worker %s", id, worker.GetHost().CertID)
		go func() {
			status, err := worker.StartJob(context.TODO(), id)
			if err != nil {
				app.logger.Errorf("job error %v", err)
			} else {
				app.logger.Debugf("job %d received processing status: %+v", id, status)
			}
		}()
	}
}

func (app *App) waitForWorker() (*grpc.Worker, error) {
	keyPrefix := path.Join(shared.ServicePrefix, shared.WorkerCapacity)
	client := app.etcdServer.Client()
	wch := client.Watch(context.Background(), keyPrefix, clientv3.WithPrefix())
	for wresp := range wch {
		for _, ev := range wresp.Events {
			if ev.Type == mvccpb.PUT {
				var c capacity
				if jerr := jsoniter.Unmarshal(ev.Kv.Value, &c); jerr == nil {
					if c.Max-c.Current > 0 {
						for _, w := range app.grpcApp.GetWorkers() {
							if w.IsReady() {
								return w, nil
							}
							fmt.Printf("not ready %s\n", w.GetCertID())
						}
					}
				}
			}
		}
	}
	return nil, fmt.Errorf("worker not found")
}

func (app *App) getMostAvailableWorker() *grpc.Worker {
find:
	electedWorker := &worker{w: nil, free: 0}
	var workers []*worker
	for _, w := range app.grpcApp.GetWorkers() {
		if w.IsReady() {
			workers = append(workers, &worker{w, app.getWorkerAvailability(w)})
		}
	}
	if len(workers) == 0 {
		goto find
	}
	for _, w := range workers {
		if electedWorker.free < w.free {
			electedWorker = w
		}
	}
	if electedWorker.w == nil || electedWorker.free <= 0 {
		time.Sleep(time.Second * 5)
		goto find
	}
	app.logger.Debugf("elected worker %s %d", electedWorker.w.GetHost().CertID, electedWorker.free)
	return electedWorker.w
}

func (app *App) getWorkerAvailability(w *grpc.Worker) int {
	keyPrefix := path.Join(shared.ServicePrefix, shared.WorkerCapacity, w.GetCertID())
	keyLock := path.Join(shared.WorkerCapacityLock)
	client := app.etcdServer.Client()
	barrier := recipe.NewBarrier(client, keyLock)

	if err := barrier.Wait(); err == nil {
		if herr := barrier.Hold(); herr == nil {
			resp, gerr := client.Get(context.TODO(), keyPrefix)
			if gerr != nil || len(resp.Kvs) < 1 {
				return 0
			}
			var c capacity
			if jerr := jsoniter.Unmarshal(resp.Kvs[0].Value, &c); jerr == nil {
				if rerr := barrier.Release(); rerr == nil {
					return c.Max - c.Current
				}
			}
			return 0
		}
	}
	return 0
}
