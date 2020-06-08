package app

import (
	"context"
	"fmt"
	"path"
	"strings"
	"sync"
	"time"

	"github.com/jkuri/abstruse/internal/pkg/shared"
	"github.com/jkuri/abstruse/internal/pkg/util"
	"github.com/jkuri/abstruse/internal/server/db/model"
	"go.etcd.io/etcd/clientv3"
	recipe "go.etcd.io/etcd/contrib/recipes"
	"go.etcd.io/etcd/mvcc/mvccpb"
	"go.uber.org/zap"
)

type jobChannel chan *shared.Job
type jobQueue chan chan *shared.Job

type scheduler struct {
	mu      sync.Mutex
	workch  jobChannel
	workerq jobQueue
	queue   *recipe.PriorityQueue
	app     *App
	client  *clientv3.Client
	logger  *zap.SugaredLogger
	readych chan struct{}
	wch     chan string
	wdch    chan string
	max     int
	running int
	pending map[uint]*shared.Job
}

func newScheduler(client *clientv3.Client, logger *zap.Logger, app *App) *scheduler {
	return &scheduler{
		workch:  make(jobChannel),
		workerq: make(jobQueue),
		queue:   recipe.NewPriorityQueue(client, shared.QueuePrefix),
		app:     app,
		client:  client,
		logger:  logger.With(zap.String("type", "scheduler")).Sugar(),
		readych: make(chan struct{}),
		wch:     make(chan string),
		wdch:    make(chan string),
		pending: make(map[uint]*shared.Job),
	}
}

func (s *scheduler) run() error {
	donech := s.watchDoneEvents()
	// queuech := s.dequeue()
	errch := make(chan error)

	go func() {
		for {
			select {
			case job := <-donech:
				go func(job *shared.Job) {
					if err := s.doneJob(job); err != nil {
						errch <- err
					}
				}(job)
			}
		}
	}()

	go func() {
		for {
			select {
			case job := <-s.workch:
				s.logger.Debugf("da")
				jobch := <-s.workerq
				s.logger.Debugf("da")
				jobch <- job
				s.logger.Debugf("da")
			case job := <-s.dequeue():
				s.logger.Debugf("da %v", job)
			}

			// loop:
			// 	worker := <-s.wch
			// 	s.logger.Debugf("worker %s ready", worker)
			// 	select {
			// 	case s.readych <- struct{}{}:
			// 	default:
			// 	}
			// 	select {
			// 	case job := <-queuech:
			// 		go func(job *shared.Job, worker string) {
			// 			if err := s.startJob(job, worker); err != nil {
			// 				errch <- err
			// 			}
			// 		}(job, worker)
			// 	case wid := <-s.wdch:
			// 		if worker == wid {
			// 			goto loop
			// 		}
			// 	}
		}
	}()

	// for {
	// 	select {
	// 	case job := <-s.workch:
	// 		jobch := <-s.workerq
	// 		jobch <- job
	// 	case job := <-donech:
	// 		go s.doneJob(job)
	// 	case wid := <-wch:
	// 		s.logger.Debugf("starting worker %s...", wid)
	// 		if worker, ok := s.app.workers[wid]; ok {
	// 			worker.start(s.workerq)
	// 		}
	// 	case wid := <-wdch:
	// 		if worker, ok := s.app.workers[wid]; ok {
	// 			worker.stop()
	// 		}
	// 	case job := <-queuech:
	// 		s.logger.Debugf("%+v", job)
	// 		// go s.startJob(job)
	// 	}
	// }
	return <-errch
}

func (s *scheduler) scheduleJob(job *shared.Job) error {
	s.logger.Infof("scheduling job %d with priority %d", job.ID, job.Priority)
	job.Status = shared.StatusQueued
	job.StartTime = nil
	job.EndTime = nil
	if err := s.save(job); err != nil {
		return err
	}
	data, err := job.Marshal()
	if err != nil {
		return err
	}
	return s.queue.Enqueue(data, uint16(job.Priority))
}

func (s *scheduler) stopJob(id uint) error {
	s.logger.Debugf("stopping job %d...", id)
	if job, ok := s.pending[id]; ok {
		job.EndTime = util.TimeNow()
		job.Status = shared.StatusFailing
		return s.put(shared.StopPrefix, job)
	}
	if job, err := s.deleteFromQueue(id); err == nil {
		job.StartTime = util.TimeNow()
		job.EndTime = util.TimeNow()
		job.Status = shared.StatusFailing
		return s.doneJob(job)
	}
	return nil
}

func (s *scheduler) setSize(max, running int) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.max, s.running = max, running
	s.logger.Debugf("capacity: [%d / %d]", s.running, s.max)
}

func (s *scheduler) doneJob(job *shared.Job) error {
	s.logger.Infof("job %d done with status: %s", job.ID, job.GetStatus())
	if err := s.save(job); err != nil {
		s.logger.Errorf("error saving job to db %d: %v", job.ID, err)
		return err
	}
	if err := s.delete(shared.PendingPrefix, job); err != nil {
		s.logger.Errorf("error deleting job %d from pending: %v", job.ID, err)
		return err
	}
	if err := s.delete(shared.DonePrefix, job); err != nil {
		s.logger.Errorf("error deleting job %d from done: %v", job.ID, err)
		return err
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.pending, job.ID)
	return nil
}

func (s *scheduler) startJob(job *shared.Job, worker string) error {
	s.logger.Debugf("job %d enqueued, sending job to worker %s", job.ID, worker)
	job.WorkerID = worker
	s.mu.Lock()
	defer s.mu.Unlock()
	s.pending[job.ID] = job
	// TODO: move this to worker?
	job.Status = shared.StatusRunning
	job.StartTime = func(t time.Time) *time.Time { return &t }(time.Now())
	if err := s.save(job); err != nil {
		s.logger.Errorf("error saving job %d to db: %v", job.ID, err)
		return err
	}
	if err := s.put(shared.PendingPrefix, job); err != nil {
		s.logger.Errorf("error saving job %d to pending: %v", job.ID, err)
		return err
	}
	return nil
}

func (s *scheduler) dequeue() <-chan *shared.Job {
	ch := make(chan *shared.Job)

	go func() {
		for {
			<-s.readych
			if data, err := s.queue.Dequeue(); err == nil {
				job := &shared.Job{}
				if job, err := job.Unmarshal(data); err == nil {
					ch <- job
				}
			}
		}
	}()

	return ch
}

func (s *scheduler) watchDoneEvents() <-chan *shared.Job {
	donech := make(chan *shared.Job)

	go func() {
		resp, err := s.client.Get(context.Background(), shared.DonePrefix, clientv3.WithPrefix())
		if err != nil {
			s.logger.Errorf("error getting done jobs: %v", err)
		} else {
			for i := range resp.Kvs {
				job := &shared.Job{}
				job, err := job.Unmarshal(string(resp.Kvs[i].Value))
				if err != nil {
					s.logger.Errorf("error unmarshaling done job: %v", err)
				} else {
					donech <- job
				}
			}
		}

		wch := s.client.Watch(context.Background(), shared.DonePrefix, clientv3.WithPrefix())
		for n := range wch {
			for _, ev := range n.Events {
				switch ev.Type {
				case mvccpb.PUT:
					job := &shared.Job{}
					job, err := job.Unmarshal(string(ev.Kv.Value))
					if err != nil {
						s.logger.Errorf("%v", err)
					}
					donech <- job
				}
			}
		}
	}()

	return donech
}

func (s *scheduler) deleteFromQueue(id uint) (*shared.Job, error) {
	job := &shared.Job{}
	resp, err := s.client.Get(context.Background(), shared.QueuePrefix, clientv3.WithPrefix())
	if err != nil {
		return job, err
	}
	for i := range resp.Kvs {
		job := &shared.Job{}
		job, err := job.Unmarshal(string(resp.Kvs[i].Value))
		if err != nil {
			return job, err
		}
		if job.ID == id {
			_, err := s.client.Delete(context.Background(), string(resp.Kvs[i].Key))
			return job, err
		}
	}
	return job, fmt.Errorf("not found")
}

func (s *scheduler) delete(prefix string, job *shared.Job) error {
	key := path.Join(prefix, fmt.Sprintf("%d", job.ID))
	_, err := s.client.Delete(context.Background(), key)
	return err
}

func (s *scheduler) put(prefix string, job *shared.Job) error {
	key := path.Join(prefix, fmt.Sprintf("%d", job.ID))
	val, err := job.Marshal()
	if err != nil {
		return err
	}
	_, err = s.client.Put(context.Background(), key, val)
	return err
}

func (s *scheduler) save(job *shared.Job) error {
	jobModel := &model.Job{
		ID:        job.ID,
		Status:    job.GetStatus(),
		StartTime: job.StartTime,
		EndTime:   job.EndTime,
		Log:       strings.Join(job.Log, ""),
	}
	_, err := s.app.jobRepository.Update(jobModel)
	if err != nil {
		return err
	}
	go s.broadcastJobStatus(job)
	return s.app.updateBuildTime(job.BuildID)
}

func (s *scheduler) broadcastJobStatus(job *shared.Job) {
	sub := path.Join("/subs", "jobs", fmt.Sprintf("%d", job.BuildID))
	event := map[string]interface{}{
		"build_id": job.BuildID,
		"job_id":   job.ID,
		"status":   job.GetStatus(),
	}
	if job.StartTime != nil {
		event["start_time"] = util.FormatTime(*job.StartTime)
	}
	if job.EndTime != nil {
		event["end_time"] = util.FormatTime(*job.EndTime)
	}
	s.app.ws.Broadcast(sub, event)
}
