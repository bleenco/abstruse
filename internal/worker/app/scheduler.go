package app

import (
	"context"
	"fmt"
	"path"
	"strconv"
	"time"

	"github.com/jkuri/abstruse/internal/pkg/shared"
	"go.etcd.io/etcd/clientv3"
	"go.etcd.io/etcd/clientv3/concurrency"
	"go.etcd.io/etcd/mvcc/mvccpb"
	"go.uber.org/zap"
)

type scheduler struct {
	ctx     context.Context
	cancel  context.CancelFunc
	id      string
	max     int
	session *concurrency.Session
	mu      *concurrency.Mutex
	logger  *zap.SugaredLogger
	app     *App
}

func newScheduler(id string, max int, logger *zap.Logger, app *App) (*scheduler, error) {
	if max < 1 {
		max = 1
	}
	return &scheduler{
		id:     id,
		max:    max,
		logger: logger.With(zap.String("type", "scheduler")).Sugar(),
		app:    app,
	}, nil
}

func (s *scheduler) run() error {
	errch := make(chan error)
	jobch := s.watchPending()
	stopch := s.watchStop()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	session, err := concurrency.NewSession(s.app.client, concurrency.WithContext(ctx))
	if err != nil {
		return err
	}
	s.session = session
	s.ctx = ctx
	s.cancel = cancel
	defer s.session.Close()
	s.mu = concurrency.NewMutex(s.session, path.Join(shared.WorkersCapacityLock, s.id))

	if err := s.saveCapacity(s.max); err != nil {
		errch <- err
	}

	go func() {
		for {
			select {
			case job := <-jobch:
				s.logger.Infof("received job %d, trying to start...", job.ID)
				go s.startJob(job)
			case job := <-stopch:
				s.logger.Infof("received job %d stop command, trying to stop...", job.ID)
				go s.stopJob(job)
			}
		}
	}()

	return <-errch
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

func (s *scheduler) watchStop() <-chan shared.Job {
	jobch := make(chan shared.Job)

	go func() {
		wch := s.app.client.Watch(context.Background(), shared.StopPrefix, clientv3.WithPrefix())
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

func (s *scheduler) startJob(job shared.Job) error {
	if err := s.decreaseCapacity(); err != nil {
		return err
	}
	s.logger.Infof("starting job %d...", job.ID)
	job.StartTime = func(t time.Time) *time.Time { return &t }(time.Now())
	if err := s.app.startJob(job); err != nil {
		job.Status = shared.StatusFailing
		s.logger.Errorf("job %d failed: %v", job.ID, err)
	} else {
		job.Status = shared.StatusPassing
		s.logger.Infof("job %d passing", job.ID)
	}
	job.EndTime = func(t time.Time) *time.Time { return &t }(time.Now())
	if err := s.putDone(job); err != nil {
		s.logger.Errorf("error saving job as done: %v", err)
		return err
	}
	return s.increaseCapacity()
}

func (s *scheduler) stopJob(job shared.Job) error {
	name := fmt.Sprintf("abstruse-job-%d", job.ID)
	s.logger.Debugf("stopping container %s...", name)
	s.app.stopJob(name)
	if err := s.deleteStop(job); err != nil {
		s.logger.Debugf("could not mark job %s as stopped: %v", err)
		return err
	}
	job.Status = shared.StatusFailing
	job.EndTime = func(t time.Time) *time.Time { return &t }(time.Now())
	if err := s.putDone(job); err != nil {
		return err
	}
	return s.increaseCapacity()
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

func (s *scheduler) deleteStop(job shared.Job) error {
	key := path.Join(shared.StopPrefix, fmt.Sprintf("%d", job.ID))
	_, err := s.app.client.Delete(context.Background(), key)
	return err
}

func (s *scheduler) increaseCapacity() error {
	err := s.mu.Lock(context.TODO())
	if err != nil {
		s.logger.Errorf("could not lock")
	} else {
		defer func() {
			if err := s.mu.Unlock(context.TODO()); err != nil {
				s.logger.Errorf("could not unlock")
			}
		}()
	}
	capacity, err := s.getCapacity()
	if err != nil {
		s.logger.Errorf("error fetching capacity: %v", err)
		return err
	}
	if capacity+1 > s.max {
		s.logger.Errorf("capacity cannot be greater than concurrency")
		return fmt.Errorf("capacity too high")
	}
	capacity = capacity + 1
	if err := s.saveCapacity(capacity); err != nil {
		s.logger.Errorf("could not save capacity: %v", err)
		return err
	}
	return nil
}

func (s *scheduler) decreaseCapacity() error {
	err := s.mu.Lock(context.TODO())
	if err != nil {
		s.logger.Errorf("could not lock")
	} else {
		defer func() {
			if err := s.mu.Unlock(context.TODO()); err != nil {
				s.logger.Errorf("could not unlock")
			}
		}()
	}
	capacity, err := s.getCapacity()
	if err != nil {
		s.logger.Errorf("error fetching capacity: %v", err)
		return err
	}
	if capacity > 0 {
		capacity = capacity - 1
	} else {
		s.logger.Errorf("capacity is full, cannot work")
		return err
	}
	if err := s.saveCapacity(capacity); err != nil {
		s.logger.Errorf("could not save capacity: %v", err)
		return err
	}
	return nil
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
