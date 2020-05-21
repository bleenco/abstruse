package scheduler

import (
	"context"
	"path"

	"github.com/jkuri/abstruse/internal/pkg/shared"
	jsoniter "github.com/json-iterator/go"
	"go.etcd.io/etcd/clientv3"
	recipe "go.etcd.io/etcd/contrib/recipes"
	"go.uber.org/zap"
)

var (
	queueKeyPrefix    = path.Join(shared.ServicePrefix, shared.QueueService)
	capacityKeyPrefix = path.Join(shared.ServicePrefix, shared.WorkerCapacity)
)

// Job definition.
type Job struct {
	ID  uint64 `json:"id"`
	URL string `json:"url"`
}

// Scheduler represents main job scheduler.
type Scheduler struct {
	queue  *recipe.PriorityQueue
	client *clientv3.Client
	logger *zap.SugaredLogger
	ctx    context.Context
	cancel context.CancelFunc
	ready  chan struct{}
}

// NewScheduler returns new scheduler instance.
func NewScheduler(client *clientv3.Client, logger *zap.Logger) *Scheduler {
	ctx, cancel := context.WithCancel(context.Background())
	return &Scheduler{
		queue:  recipe.NewPriorityQueue(client, queueKeyPrefix),
		client: client,
		logger: logger.With(zap.String("type", "scheduler")).Sugar(),
		ctx:    ctx,
		cancel: cancel,
		ready:  make(chan struct{}),
	}
}

// Start the scheduler.
func (s *Scheduler) Start() error {
	s.logger.Infof("starting scheduler")
	for {
		select {
		case <-s.ctx.Done():
			return s.ctx.Err()
		case <-s.ready:
			next, err := s.queue.Dequeue()
			if err != nil {
				return err
			}
			var job Job
			if err = jsoniter.UnmarshalFromString(next, job); err != nil {
				return err
			}
		}
	}
}

// Schedule adds new job to the queue.
func (s *Scheduler) Schedule(job *Job, priority uint16) error {
	data, err := jsoniter.MarshalToString(job)
	if err != nil {
		return err
	}
	if err := s.queue.Enqueue(data, priority); err != nil {
		return err
	}
	return nil
}

// Next returns next job from the queue.
func (s *Scheduler) Next() (*Job, error) {
	next, err := s.queue.Dequeue()
	if err != nil {
		return nil, err
	}
	job := &Job{}
	if err := jsoniter.UnmarshalFromString(next, job); err != nil {
		return nil, err
	}
	return job, nil
}
