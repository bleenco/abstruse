package grpc

import (
	"context"
	"path"
	"sync"

	"github.com/jkuri/abstruse/internal/pkg/job"
	"github.com/jkuri/abstruse/internal/pkg/shared"
	jsoniter "github.com/json-iterator/go"
	"go.etcd.io/etcd/clientv3"
	recipe "go.etcd.io/etcd/contrib/recipes"
	"go.uber.org/zap"
)

var (
	queueNS = path.Join(shared.ServicePrefix, "jobs", "queue")
)

// Scheduler is main job queue and scheduler.
type Scheduler struct {
	mu     sync.Mutex
	queue  *recipe.PriorityQueue
	logger *zap.SugaredLogger
	rpc    *App
	client *clientv3.Client
	paused bool
	ready  chan struct{}
	ctx    context.Context
}

// NewScheduler returns new instance of Scheduler.
func NewScheduler(ctx context.Context, logger *zap.Logger, rpc *App) *Scheduler {
	return &Scheduler{
		ctx:    ctx,
		logger: logger.With(zap.String("type", "scheduler")).Sugar(),
		rpc:    rpc,
		ready:  make(chan struct{}),
	}
}

// Start starts the scheduler.
func (s *Scheduler) Start(client *clientv3.Client) error {
	s.client = client
	s.queue = recipe.NewPriorityQueue(client, queueNS)

	for {
		json, err := s.queue.Dequeue()
		if err != nil {
			return err
		}
		var j *job.Job
		if err := jsoniter.UnmarshalFromString(json, &j); err != nil {
			return err
		}
		worker := s.findWorker()
		s.logger.Debugf("sending job %d to worker %s", j.ID, worker.ID)

		go func(j *job.Job) {
			status, err := worker.StartJob(context.TODO(), j)
			if err != nil {
				s.logger.Debugf("job %d errored with %v", j.ID, err)
			} else {
				s.logger.Debugf("job %d done with %v", j.ID, status)
			}
		}(j)
	}
}

// Schedule adds job to queue.
func (s *Scheduler) Schedule(j *job.Job) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.logger.Debugf("scheduling job %d with priority %d", j.ID, j.Priority)
	return s.queue.Enqueue(j.Value(), j.Priority)
}

func (s *Scheduler) findWorker() *Worker {
	var w *Worker
	for _, worker := range s.rpc.GetWorkers() {
		if w == nil || worker.Concurrency.Free > w.Concurrency.Free {
			w = worker
		}
	}
	if w == nil {
		w = <-s.rpc.WorkerReady
	}
	return w
}
