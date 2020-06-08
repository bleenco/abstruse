package app

import (
	"context"
	"fmt"
	"path"
	"sync"

	"github.com/jkuri/abstruse/internal/pkg/shared"
	"github.com/jkuri/abstruse/internal/pkg/util"
	"go.etcd.io/etcd/clientv3"
	"go.etcd.io/etcd/mvcc/mvccpb"
	"go.uber.org/zap"
)

type scheduler struct {
	id           string
	mu           sync.Mutex
	logger       *zap.SugaredLogger
	app          *App
	max, running int
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

	go func() {
		for {
			select {
			case job := <-jobch:
				s.logger.Infof("received job %d, trying to start...", job.ID)
				go s.startJob(job)
			case job := <-stopch:
				s.logger.Infof("received job %d stop command, trying to stop...", job.ID)
				go s.stopJob(job)
			case <-s.app.ready:
			}
		}
	}()

	return <-errch
}

func (s *scheduler) watchPending() <-chan *shared.Job {
	jobch := make(chan *shared.Job)

	go func() {
		wch := s.app.client.Watch(context.Background(), shared.PendingPrefix, clientv3.WithPrefix())
		for n := range wch {
			for _, ev := range n.Events {
				switch ev.Type {
				case mvccpb.PUT:
					job := &shared.Job{}
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

func (s *scheduler) watchStop() <-chan *shared.Job {
	jobch := make(chan *shared.Job)

	go func() {
		wch := s.app.client.Watch(context.Background(), shared.StopPrefix, clientv3.WithPrefix())
		for n := range wch {
			for _, ev := range n.Events {
				switch ev.Type {
				case mvccpb.PUT:
					job := shared.Job{}
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

func (s *scheduler) startJob(job *shared.Job) error {
	s.mu.Lock()
	s.running++
	s.mu.Unlock()
	// if err := s.app.emitCapacityInfo(); err != nil {
	// 	return err
	// }
	s.logger.Infof("starting job %d...", job.ID)
	job.StartTime = util.TimeNow()
	if err := s.app.startJob(job); err != nil {
		job.Status = shared.StatusFailing
		s.logger.Errorf("job %d failed: %v", job.ID, err)
	} else {
		job.Status = shared.StatusPassing
		s.logger.Infof("job %d passing", job.ID)
	}
	job.EndTime = util.TimeNow()
	if err := s.putDone(job); err != nil {
		s.logger.Errorf("error saving job as done: %v", err)
		return err
	}
	return nil
}

func (s *scheduler) stopJob(job *shared.Job) error {
	name := fmt.Sprintf("abstruse-job-%d", job.ID)
	s.logger.Debugf("stopping container %s...", name)
	s.app.stopJob(name)
	if err := s.deleteStop(job); err != nil {
		s.logger.Debugf("could not mark job %s as stopped: %v", err)
		return err
	}
	// job.Status = shared.StatusFailing
	// job.EndTime = util.TimeNow()
	// if err := s.putDone(job); err != nil {
	// 	return err
	// }
	return nil
}

func (s *scheduler) putDone(job *shared.Job) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	key := path.Join(shared.DonePrefix, fmt.Sprintf("%d", job.ID))
	val, err := job.Marshal()
	if err != nil {
		return err
	}
	if _, err = s.app.client.Put(context.Background(), key, val); err != nil {
		return err
	}
	s.running--
	// if err := s.app.emitCapacityInfo(); err != nil {
	// 	return err
	// }
	return nil
}

func (s *scheduler) deleteStop(job *shared.Job) error {
	key := path.Join(shared.StopPrefix, fmt.Sprintf("%d", job.ID))
	_, err := s.app.client.Delete(context.Background(), key)
	return err
}
