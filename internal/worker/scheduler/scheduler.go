package scheduler

import (
	"sync"

	"github.com/google/wire"
	"go.uber.org/zap"
)

// Scheduler service
type Scheduler struct {
	opts        *Options
	logger      *zap.SugaredLogger
	concurrency concurrency
}

type concurrency struct {
	mu      sync.Mutex
	Max     int `json:"max"`
	Current int `json:"current"`
}

// NewScheduler returns new instance of a Scheduler.
func NewScheduler(opts *Options, logger *zap.Logger) *Scheduler {
	return &Scheduler{
		opts:        opts,
		logger:      logger.With(zap.String("type", "scheduler")).Sugar(),
		concurrency: concurrency{Max: opts.Max, Current: 0},
	}
}

// UpdateConcurrency updates capacity status.
func (s *Scheduler) UpdateConcurrency(current int) {
	s.concurrency.mu.Lock()
	defer s.concurrency.mu.Unlock()
	s.concurrency.Current = current
}

// Concurrency returns current concurrency status.
func (s *Scheduler) Concurrency() (int, int) {
	s.concurrency.mu.Lock()
	defer s.concurrency.mu.Unlock()
	return s.concurrency.Max, s.concurrency.Current
}

// ProviderSet exports for wire.
var ProviderSet = wire.NewSet(NewOptions, NewScheduler)
