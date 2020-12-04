package app

import (
	"sync"

	pb "github.com/bleenco/abstruse/pb"
	"go.uber.org/zap"
)

type scheduler struct {
	mu      sync.Mutex
	logger  *zap.SugaredLogger
	app     *App
	jobch   chan *pb.Job
	max     int
	running int
	quit    chan struct{}
}

func newScheduler(max int, logger *zap.Logger, app *App) *scheduler {
	if max < 1 {
		max = 1
	}
	return &scheduler{
		max:    max,
		logger: logger.With(zap.String("type", "scheduler")).Sugar(),
		app:    app,
		jobch:  make(chan *pb.Job, max),
		quit:   make(chan struct{}, 1),
	}
}

func (s *scheduler) run() error {
	s.logger.Infof("starting scheduler loop")
	for {
		select {
		case job := <-s.jobch:
			go s.startJob(job)
		case <-s.quit:
			return nil
		}
	}
}

func (s *scheduler) stop() {
	s.quit <- struct{}{}
}

func (s *scheduler) next(job *pb.Job) {
	s.jobch <- job
}

func (s *scheduler) startJob(job *pb.Job) error {
	s.logger.Infof("starting job %d...", job.GetId())
	defer s.logger.Infof("job %d done", job.GetId())
	return nil
}
