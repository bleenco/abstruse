package worker

import (
	"fmt"
	"sync"

	"github.com/bleenco/abstruse/server/core"
	"go.uber.org/zap"
)

// NewRegistry returns new worker registry.
func NewRegistry(logger *zap.Logger) core.WorkerRegistry {
	return &workerRegistry{
		workers: make(map[string]*core.Worker),
		logger:  logger.With(zap.String("type", "registry")).Sugar(),
	}
}

type workerRegistry struct {
	mu      sync.Mutex
	workers map[string]*core.Worker
	logger  *zap.SugaredLogger
}

func (wr *workerRegistry) Add(worker *core.Worker) error {
	wr.mu.Lock()
	defer wr.mu.Unlock()
	wr.workers[worker.Host.ID] = worker
	wr.logger.Infof("adding worker %s to the worker registry", worker.Host.ID)
	return nil
}

func (wr *workerRegistry) Delete(id string) error {
	wr.mu.Lock()
	defer wr.mu.Unlock()
	delete(wr.workers, id)
	wr.logger.Infof("removing worker %s from the worker registry", id)
	return nil
}

func (wr *workerRegistry) List() ([]*core.Worker, error) {
	wr.mu.Lock()
	defer wr.mu.Unlock()

	var workers []*core.Worker
	for _, w := range wr.workers {
		workers = append(workers, w)
	}
	return workers, nil
}

func (wr *workerRegistry) findWorker(id string) (*core.Worker, error) {
	for wid, worker := range wr.workers {
		if wid == id {
			return worker, nil
		}
	}

	return nil, fmt.Errorf("worker %s not found", id)
}
