package server

import (
	"context"
	"path"
	"time"

	jsoniter "github.com/json-iterator/go"
	"go.etcd.io/etcd/clientv3"

	"github.com/jkuri/abstruse/internal/pkg/shared"
	"github.com/jkuri/abstruse/internal/server/grpc"
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
	for i := 0; i < 100; i++ {
		id := uint64(i) + 1
		worker := app.getMostAvailableWorker()
		app.logger.Debugf("sending job %d to worker %s", id, worker.GetHost().CertID)
		go func() {
			status, err := worker.StartJob(context.TODO(), id)
			if err != nil {
				app.logger.Errorf("job error %v", err)
			} else {
				app.logger.Debugf("job %d received processing status: %+v", id, status)
			}
		}()
		time.Sleep(300 * time.Millisecond)
	}
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
		time.Sleep(time.Second)
		goto find
	}
	for _, w := range workers {
		if electedWorker.free < w.free {
			electedWorker = w
		}
	}
	if electedWorker.w == nil {
		time.Sleep(time.Second)
		goto find
	}
	app.logger.Debugf("elected worker %s", electedWorker.w.GetHost().CertID)
	return electedWorker.w
}

func (app *App) getWorkerAvailability(w *grpc.Worker) int {
	keyPrefix := path.Join(shared.ServicePrefix, shared.WorkerCapacity, w.GetCertID())
	client := app.etcdServer.Client()
	resp, err := client.Get(context.TODO(), keyPrefix, clientv3.WithLastRev()...)
	if err != nil || len(resp.Kvs) < 1 {
		return 0
	}
	var c capacity
	err = jsoniter.Unmarshal(resp.Kvs[0].Value, &c)
	if err != nil {
		return 0
	}
	return c.Max - c.Current
}
