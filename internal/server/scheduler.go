package server

import (
	"context"
	"time"

	"github.com/jkuri/abstruse/internal/server/grpc"
)

func (app *App) scheduleJobs() {
	for i := 0; i < 10; i++ {
		id := uint64(i) + 1
		worker := app.getMostAvailableWorker()
		app.logger.Debugf("sending job %d to worker %s", id, worker.GetHost().CertID)
		status, err := worker.StartJob(context.Background(), id)
		if err != nil {
			app.logger.Errorf("job error %v", err)
		} else {
			app.logger.Debugf("job %d received processing status: %+v", id, status)
		}
		time.Sleep(time.Second * 1)
	}
}

func (app *App) getMostAvailableWorker() *grpc.Worker {
	var worker *grpc.Worker
find:
	for _, w := range app.grpcApp.GetWorkers() {
		if w.IsReady() {
			worker = w
		}
	}
	if worker == nil {
		time.Sleep(time.Second * 1)
		goto find
	}
	app.logger.Debugf("found available worker %s", worker.GetHost().CertID)
	return worker
}
