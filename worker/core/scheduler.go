package core

import (
	"context"
	"encoding/json"
	"fmt"
	"path"
	"sync"

	"github.com/bleenco/abstruse/internal/common"
	"github.com/bleenco/abstruse/pkg/lib"
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
	quit         chan struct{}
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
		quit:   make(chan struct{}, 1),
	}, nil
}

func (s *scheduler) run() {
	jobch := s.watchPending()
	stopch := s.watchStop()

	for {
		select {
		case job := <-jobch:
			s.logger.Infof("received job %d, starting...", job.ID)
			go s.startJob(job)
		case job := <-stopch:
			s.logger.Infof("received job %d stop, stopping...", job.ID)
			go s.stopJob(job)
		case <-s.quit:
			return
		}
	}
}

func (s *scheduler) stop() {
	s.quit <- struct{}{}
}

func (s *scheduler) watchPending() <-chan common.Job {
	jobch := make(chan common.Job)

	go func() {
		wch := s.app.client.Watch(context.Background(), common.PendingPrefix, clientv3.WithPrefix())
		for n := range wch {
			for _, ev := range n.Events {
				switch ev.Type {
				case mvccpb.PUT:
					job := common.Job{}
					if err := json.Unmarshal(ev.Kv.Value, &job); err == nil {
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

func (s *scheduler) watchStop() <-chan common.Job {
	jobch := make(chan common.Job)

	go func() {
		wch := s.app.client.Watch(context.Background(), common.StopPrefix, clientv3.WithPrefix())
		for n := range wch {
			for _, ev := range n.Events {
				switch ev.Type {
				case mvccpb.PUT:
					job := common.Job{}
					if err := json.Unmarshal(ev.Kv.Value, &job); err == nil {
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

func (s *scheduler) startJob(job common.Job) error {
	s.mu.Lock()
	s.running++
	s.mu.Unlock()
	job.StartTime = lib.TimeNow()
	if err := s.app.startJob(job); err != nil {
		job.Status = common.StatusFailing
		s.logger.Errorf("job %d failed: %v", job.ID, err)
	} else {
		job.Status = common.StatusPassing
		s.logger.Infof("job %d passing", job.ID)
	}
	job.EndTime = lib.TimeNow()
	if err := s.deletePending(job); err != nil {
		s.logger.Errorf("error delete from pending %d", job.ID)
		return err
	}
	if err := s.putDone(job); err != nil {
		s.logger.Errorf("error saving job as done: %v", err)
		return err
	}
	return nil
}

func (s *scheduler) stopJob(job common.Job) error {
	name := fmt.Sprintf("abstruse-job-%d", job.ID)
	s.logger.Debugf("stopping container %s...", name)
	if err := s.app.stopJob(name); err == nil {
		if err := s.deleteStop(job); err != nil {
			s.logger.Debugf("could not mark job %s as stopped: %v", err)
			return err
		}
	}
	return nil
}

func (s *scheduler) deletePending(job common.Job) error {
	key := path.Join(common.PendingPrefix, fmt.Sprintf("%d", job.ID))
	if _, err := s.app.client.Delete(context.Background(), key); err != nil {
		return err
	}
	return nil
}

func (s *scheduler) putDone(job common.Job) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	key := path.Join(common.DonePrefix, fmt.Sprintf("%d", job.ID))
	val, err := json.Marshal(&job)
	if err != nil {
		return err
	}
	if _, err = s.app.client.Put(context.Background(), key, string(val)); err != nil {
		return err
	}
	s.running--
	return nil
}

func (s *scheduler) deleteStop(job common.Job) error {
	key := path.Join(common.StopPrefix, fmt.Sprintf("%d", job.ID))
	_, err := s.app.client.Delete(context.Background(), key)
	return err
}
