package scheduler

import (
	"context"
	"path"
	"sync"

	"github.com/jkuri/abstruse/internal/pkg/job"
	"github.com/jkuri/abstruse/internal/pkg/shared"
	"github.com/jkuri/abstruse/internal/server/grpc"
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
	rpc    *grpc.App
	client *clientv3.Client
	paused bool
	ready  chan struct{}
	ctx    context.Context
}

type worker struct {
	w    *grpc.Worker
	free int
}

// NewScheduler returns new instance of Scheduler.
func NewScheduler(
	ctx context.Context,
	client *clientv3.Client,
	logger *zap.Logger,
	rpc *grpc.App,
) *Scheduler {
	return &Scheduler{
		ctx:    ctx,
		queue:  recipe.NewPriorityQueue(client, queueNS),
		logger: logger.With(zap.String("type", "scheduler")).Sugar(),
		rpc:    rpc,
		ready:  make(chan struct{}),
	}
}

// Start starts the scheduler.
func (s *Scheduler) Start() error {
	for {
		json, err := s.queue.Dequeue()
		if err != nil {
			return err
		}
		var j *job.Job
		if err := jsoniter.UnmarshalFromString(json, j); err != nil {
			return err
		}

	}
}

// Schedule adds job to queue.
func (s *Scheduler) Schedule(j *job.Job) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.logger.Debugf("scheduling job %d with priority %d", j.ID, j.Priority)
	return s.queue.Enqueue(j.value(), j.priority())
}

func (s *Scheduler) findWorker() *grpc.Worker {
	var workers map[string]worker
	for id, w := range s.rpc.GetWorkers() {
		result, err := w.Concurrency(context.TODO())
		if err != nil {
			free := result.GetMax() - result.GetCurrent()
			if free > 0 {
				workers[id] = worker{w, int(free)}
			}
		}
	}
}
