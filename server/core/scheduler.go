package core

import (
	"sync"

	"github.com/bleenco/abstruse/internal/common"
	"go.etcd.io/etcd/clientv3"
	recipe "go.etcd.io/etcd/contrib/recipes"
	"go.uber.org/zap"
)

// Scheduler contains logic for etcd backed priority job scheduler.
type Scheduler struct {
	mu      sync.Mutex
	paused  bool
	client  *clientv3.Client
	queue   *recipe.PriorityQueue
	workers map[string]*Worker
	pending map[uint]*common.Job
	logger  *zap.SugaredLogger
	ready   chan struct{}
	done    chan struct{}
}

// NewScheduler returns a new Scheduler instance.
func NewScheduler(logger *zap.Logger) *Scheduler {
	return &Scheduler{
		ready:   make(chan struct{}, 1),
		workers: make(map[string]*Worker),
		pending: make(map[uint]*common.Job),
		logger:  logger.With(zap.String("type", "scheduler")).Sugar(),
	}
}

// Run starts the scheduler.
func (s *Scheduler) Run(client *clientv3.Client) error {
	s.client = client
	s.queue = recipe.NewPriorityQueue(client, common.QueuePrefix)

	s.logger.Infof("starting main scheduler")

	for {
		select {
		case <-s.ready:
			s.process()
		case <-s.done:
			return nil
		}
	}
}

// Stop stops the scheduler.
func (s *Scheduler) Stop() {
	s.done <- struct{}{}
}

func (s *Scheduler) process() {}
