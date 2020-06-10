package pqueue

import (
	"context"
	"sync"

	"github.com/jkuri/abstruse/internal/core"
	"github.com/jkuri/abstruse/internal/pkg/shared"
	jsoniter "github.com/json-iterator/go"
	"go.etcd.io/etcd/clientv3"
	recipe "go.etcd.io/etcd/contrib/recipes"
	"go.uber.org/zap"
)

// PriorityQueue contains logic for etcd backed priority scheduler.
type PriorityQueue struct {
	mu      sync.Mutex
	next    chan struct{}
	paused  bool
	queue   *recipe.PriorityQueue
	workers map[string]struct{}
	logger  *zap.SugaredLogger
	ctx     context.Context
}

// NewPriorityQueue returns a new PriorityQueue instance.
func NewPriorityQueue(client *clientv3.Client, logger *zap.Logger) core.Scheduler {
	return PriorityQueue{
		next:    make(chan struct{}, 1),
		queue:   recipe.NewPriorityQueue(client, shared.QueuePrefix),
		workers: make(map[string]struct{}),
		logger:  logger.With(zap.String("type", "scheduler")).Sugar(),
		ctx:     context.Background(),
	}
}

// Start starts the scheduler.
func (q PriorityQueue) Start() error {
	for {
		select {
		case <-q.ctx.Done():
			return q.ctx.Err()
		case <-q.next:
			q.process()
		}
	}
}

// Schedule adds new job for execution in queue with priority.
func (q PriorityQueue) Schedule(job core.Job) error {
	val, err := jsoniter.MarshalToString(&job)
	if err != nil {
		return err
	}
	if err = q.queue.Enqueue(val, job.Priority); err != nil {
		return err
	}
	select {
	case q.next <- struct{}{}:
	default:
	}
	return nil
}

// Pause pauses jobs in the queue waiting for execution.
func (q PriorityQueue) Pause() error {
	q.mu.Lock()
	defer q.mu.Unlock()
	q.paused = true
	return nil
}

// Resume unpauses scheduler and continues with jobs
// waiting for execution.
func (q PriorityQueue) Resume() error {
	q.mu.Lock()
	q.paused = false
	q.mu.Unlock()
	select {
	case q.next <- struct{}{}:
	default:
	}
	return nil
}

// Cancel stops job if pending or removes from queue.
func (q PriorityQueue) Cancel(id uint) error {
	return nil
}

func (q PriorityQueue) process() error {
	q.mu.Lock()
	count := len(q.workers)
	pause := q.paused
	q.mu.Unlock()
	if pause || count == 0 {
		return nil
	}

	return nil
}
