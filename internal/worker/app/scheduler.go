package app

import (
	"sync"

	pb "github.com/jkuri/abstruse/proto"
	"go.uber.org/zap"
)

type scheduler struct {
	mu      sync.Mutex
	max     int32
	running int32

	jobch       chan *pb.JobTask
	concurrency chan struct{}
	donech      chan struct{}
	app         *App
	logger      *zap.SugaredLogger
}

func newScheduler(max int32, app *App, logger *zap.Logger) *scheduler {
	if max <= 0 {
		max = 1
	}
	return &scheduler{
		max:         max,
		jobch:       make(chan *pb.JobTask),
		concurrency: make(chan struct{}, max),
		donech:      make(chan struct{}),
		app:         app,
		logger:      logger.With(zap.String("type", "scheduler")).Sugar(),
	}
}

func (s *scheduler) run() {
	s.logger.Infof("starting worker main scheduler")

	for {
		select {
		case job := <-s.jobch:
			switch code := job.GetCode(); code {
			case pb.JobTask_Start:

			}
		case <-s.donech:
			break
		}
	}
}

func (s *scheduler) stop() {
	go func() { close(s.donech) }()
}

func (s *scheduler) add() error {
	select {
	case s.concurrency <- struct{}{}:
		break
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	s.running++
	return s.app.emitCapacityInfo()
}

func (s *scheduler) done() error {
	<-s.concurrency
	s.mu.Lock()
	defer s.mu.Unlock()
	s.running--
	return s.app.emitCapacityInfo()
}
