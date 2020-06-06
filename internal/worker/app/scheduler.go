package app

import (
	"context"
	"fmt"
	"path"
	"strconv"

	"github.com/jkuri/abstruse/internal/pkg/shared"
	"go.etcd.io/etcd/clientv3"
	"go.etcd.io/etcd/mvcc/mvccpb"
	"go.uber.org/zap"
)

// type scheduler struct {
// 	mu      sync.Mutex
// 	max     int32
// 	running int32

// 	jobch       chan *pb.JobTask
// 	concurrency chan struct{}
// 	donech      chan struct{}
// 	app         *App
// 	logger      *zap.SugaredLogger
// }

// func newScheduler(max int32, app *App, logger *zap.Logger) *scheduler {
// 	if max <= 0 {
// 		max = 1
// 	}
// 	return &scheduler{
// 		max:         max,
// 		jobch:       make(chan *pb.JobTask),
// 		concurrency: make(chan struct{}, max),
// 		donech:      make(chan struct{}),
// 		app:         app,
// 		logger:      logger.With(zap.String("type", "scheduler")).Sugar(),
// 	}
// }

// func (s *scheduler) run() {
// 	s.logger.Infof("starting worker main scheduler")

// 	for {
// 		select {
// 		case job := <-s.jobch:
// 			switch code := job.GetCode(); code {
// 			case pb.JobTask_Start:

// 			}
// 		case <-s.donech:
// 			break
// 		}
// 	}
// }

// func (s *scheduler) stop() {
// 	go func() { close(s.donech) }()
// }

// func (s *scheduler) add() error {
// 	select {
// 	case s.concurrency <- struct{}{}:
// 		break
// 	}
// 	s.mu.Lock()
// 	defer s.mu.Unlock()
// 	s.running++
// 	return s.app.emitCapacityInfo()
// }

// func (s *scheduler) done() error {
// 	<-s.concurrency
// 	s.mu.Lock()
// 	defer s.mu.Unlock()
// 	s.running--
// 	return s.app.emitCapacityInfo()
// }

type scheduler struct {
	id          string
	concurrency int
	logger      *zap.SugaredLogger
	app         *App
}

func newScheduler(id string, concurrency int, logger *zap.Logger, app *App) (*scheduler, error) {
	if concurrency < 1 {
		concurrency = 1
	}
	return &scheduler{
		id:          id,
		concurrency: concurrency,
		logger:      logger.With(zap.String("type", "scheduler")).Sugar(),
		app:         app,
	}, nil
}

func (s *scheduler) run() error {
	jobch := s.watchPending()

	if err := s.saveCapacity(s.concurrency); err != nil {
		return err
	}

	for {
		select {
		case job := <-jobch:
			s.logger.Infof("received job %d, trying to start...", job.ID)
			capacity, err := s.getCapacity()
			if err != nil {
				s.logger.Errorf("error fetching capacity: %v", err)
				continue
			}
			if capacity > 0 {
				capacity = capacity - 1
			} else {
				s.logger.Errorf("capacity is full, cannot work")
				continue
			}
			if err := s.saveCapacity(capacity); err == nil {
				s.logger.Infof("starting job %d...", job.ID)
				go func(job shared.Job) {
					if err := s.app.startJob(job); err != nil {
						job.Status = shared.StatusFailing
						s.logger.Errorf("job %d failed: %v", job.ID, err)
					} else {
						job.Status = shared.StatusPassing
						s.logger.Infof("job %d passing", job.ID)
					}
					capacity, err := s.getCapacity()
					if err != nil {
						s.logger.Errorf("error fetching capacity: %v", err)
					}
					if capacity+1 > s.concurrency {
						s.logger.Errorf("capacity cannot be greater than concurrency")
					} else {
						capacity = capacity + 1
						if err := s.saveCapacity(capacity); err == nil {
							if err = s.putDone(job); err != nil {
								s.logger.Errorf("error saving job as done: %v", err)
							}
						}
					}

				}(job)
			}
		}
	}
}

func (s *scheduler) watchPending() <-chan shared.Job {
	jobch := make(chan shared.Job)

	go func() {
		wch := s.app.client.Watch(context.Background(), shared.PendingPrefix, clientv3.WithPrefix())
		for n := range wch {
			for _, ev := range n.Events {
				switch ev.Type {
				case mvccpb.PUT:
					var job shared.Job
					if job, err := job.Unmarshal(string(ev.Kv.Value)); err == nil {
						if job.WorkerID == s.id {
							jobch <- job
						}
					}
				}
			}
		}
	}()

	return jobch
}

func (s *scheduler) putDone(job shared.Job) error {
	key := path.Join(shared.DonePrefix, fmt.Sprintf("%d", job.ID))
	val, err := job.Marshal()
	if err != nil {
		return err
	}
	_, err = s.app.client.Put(context.Background(), key, val)
	return err
}

func (s *scheduler) saveCapacity(capacity int) error {
	key := path.Join(shared.WorkersCapacity, s.id)
	val := fmt.Sprintf("%d", capacity)
	_, err := s.app.client.Put(context.Background(), key, val)
	return err
}

func (s *scheduler) getCapacity() (int, error) {
	key := path.Join(shared.WorkersCapacity, s.id)
	resp, err := s.app.client.Get(context.Background(), key, clientv3.WithLastRev()...)
	if err != nil {
		return 0, err
	}
	return strconv.Atoi(string(resp.Kvs[0].Value))
}
