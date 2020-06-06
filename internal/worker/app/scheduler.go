package app

import (
	"context"
	"fmt"
	"path"
	"strconv"
	"time"

	"github.com/jkuri/abstruse/internal/pkg/shared"
	"go.etcd.io/etcd/clientv3"
	"go.etcd.io/etcd/mvcc/mvccpb"
	"go.uber.org/zap"
)

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
					job.StartTime = func(t time.Time) *time.Time { return &t }(time.Now())
					if err := s.app.startJob(job); err != nil {
						job.Status = shared.StatusFailing
						s.logger.Errorf("job %d failed: %v", job.ID, err)
					} else {
						job.Status = shared.StatusPassing
						s.logger.Infof("job %d passing", job.ID)
					}
					job.EndTime = func(t time.Time) *time.Time { return &t }(time.Now())
					if err = s.putDone(job); err != nil {
						s.logger.Errorf("error saving job as done: %v", err)
					}
					capacity, err := s.getCapacity()
					if err != nil {
						s.logger.Errorf("error fetching capacity: %v", err)
					}
					if capacity+1 > s.concurrency {
						s.logger.Errorf("capacity cannot be greater than concurrency")
					} else {
						capacity = capacity + 1
						if err := s.saveCapacity(capacity); err != nil {
							s.logger.Errorf("error saving capacity: %v\n", err)
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
