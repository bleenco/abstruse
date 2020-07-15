package core

import (
	"context"
	"encoding/json"
	"fmt"
	"path"
	"strings"
	"sync"

	"github.com/bleenco/abstruse/internal/common"
	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/server/db/model"
	"go.etcd.io/etcd/clientv3"
	recipe "go.etcd.io/etcd/contrib/recipes"
	"go.etcd.io/etcd/mvcc/mvccpb"
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
	app     *App
	ready   chan struct{}
	done    chan struct{}
	ctx     context.Context
}

// NewScheduler returns a new Scheduler instance.
func NewScheduler(logger *zap.Logger, app *App) *Scheduler {
	return &Scheduler{
		ready:   make(chan struct{}, 1),
		workers: make(map[string]*Worker),
		pending: make(map[uint]*common.Job),
		logger:  logger.With(zap.String("type", "scheduler")).Sugar(),
		app:     app,
		ctx:     context.Background(),
	}
}

// Run starts the scheduler.
func (s *Scheduler) Run(client *clientv3.Client) error {
	s.client = client
	s.queue = recipe.NewPriorityQueue(client, common.QueuePrefix)

	s.logger.Infof("starting main scheduler")

	go s.watchDone()

	for {
		select {
		case <-s.ready:
			s.process()
		case <-s.ctx.Done():
			return s.ctx.Err()
		case <-s.done:
			return nil
		}
	}
}

// Stop stops the scheduler.
func (s *Scheduler) Stop() {
	s.done <- struct{}{}
}

// Schedule adds new job for execution in queue with priority.
func (s *Scheduler) Schedule(job *common.Job) error {
	job.Status = common.StatusQueued
	job.StartTime = nil
	job.EndTime = nil
	if err := s.save(job); err != nil {
		return err
	}

	val, err := json.Marshal(&job)
	if err != nil {
		return err
	}

	if err = s.queue.Enqueue(string(val), job.Priority); err != nil {
		return err
	}

	s.logger.Debugf("job %d scheduled in the queue with priority %d", job.ID, job.Priority)
	s.next()
	return nil
}

// Pause pauses jobs in the queue waiting for execution.
func (s *Scheduler) Pause() error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.paused = true
	return nil
}

// Resume unpauses scheduler and continues with jobs
// waiting for execution.
func (s *Scheduler) Resume() error {
	s.mu.Lock()
	s.paused = false
	s.mu.Unlock()
	s.next()
	return nil
}

// Cancel stops job if pending or removes from queue.
func (s *Scheduler) Cancel(id uint) error {
	resp, err := s.client.Get(context.TODO(), common.QueuePrefix, clientv3.WithPrefix())
	if err != nil {
		return err
	}
	for i := range resp.Kvs {
		key, val, job := string(resp.Kvs[i].Key), resp.Kvs[i].Value, &common.Job{}
		if err := json.Unmarshal(val, &job); err == nil {
			if job.ID == id {
				s.logger.Debugf("removing job %d from queue...", job.ID)
				if _, err := s.client.Delete(context.TODO(), key); err != nil {
					return err
				}
				job.StartTime = lib.TimeNow()
				job.EndTime = lib.TimeNow()
				job.Status = common.StatusFailing
				if err := s.save(job); err != nil {
					return err
				}
				return nil
			}
		} else {
			s.logger.Errorf("error unmarshaling job: %v", err)
		}
	}
	s.mu.Lock()
	if job, ok := s.pending[id]; ok {
		s.mu.Unlock()
		s.logger.Debugf("stopping job %d...", id)
		job.EndTime = lib.TimeNow()
		job.Status = common.StatusFailing
		key := path.Join(common.StopPrefix, fmt.Sprintf("%d", job.ID))
		val, err := json.Marshal(&job)
		if err != nil {
			return err
		}
		if _, err := s.client.Put(context.TODO(), key, string(val)); err != nil {
			return err
		}
		return nil
	}
	s.mu.Unlock()
	return nil
}

// AddWorker adds worker to schedulers worker list.
func (s *Scheduler) AddWorker(w *Worker) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.workers[w.id] = w
	s.logger.Debugf("worker %s added to scheduler list", w.id)
	s.next()
}

// DeleteWorker removes worker from schedulers worker list.
func (s *Scheduler) DeleteWorker(id string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.workers, id)
	s.logger.Debugf("worker %s deleted from scheduler list", id)
}

func (s *Scheduler) process() error {
	s.mu.Lock()
	count := len(s.workers)
	pause := s.paused
	s.mu.Unlock()
	if pause || count == 0 {
		return nil
	}

	var worker *Worker
	var c int
	s.mu.Lock()
	for _, w := range s.workers {
		w.mu.Lock()
		diff := w.max - w.running
		if diff > c {
			worker, c = w, diff
		}
		w.mu.Unlock()
	}
	s.mu.Unlock()
	if c == 0 || s.queueLen() == 0 {
		return nil
	}

	data, err := s.queue.Dequeue()
	if err != nil {
		s.logger.Errorf("error while dequeue: %v", err)
		return err
	}
	job := &common.Job{}
	if err := json.Unmarshal([]byte(data), &job); err != nil {
		s.logger.Errorf("error while unmarshaling job: %v", err)
		return err
	}

	worker.mu.Lock()
	worker.running++
	worker.mu.Unlock()
	worker.emitUsage()
	job.WorkerID = worker.id
	s.logger.Debugf("job %d enqueued, sending to worker %s...", job.ID, job.WorkerID)
	if err := s.startJob(job); err != nil {
		s.logger.Errorf("error starting job %d: %v", job.ID, err)
	}

	return nil
}

func (s *Scheduler) startJob(job *common.Job) error {
	data, err := json.Marshal(&job)
	if err != nil {
		return err
	}
	go s.jobLogs(job.WorkerID, job.ID, job.BuildID)
	_, err = s.app.client.Put(context.Background(), path.Join(common.PendingPrefix, fmt.Sprintf("%d", job.ID)), string(data))
	if err != nil {
		return err
	}
	s.mu.Lock()
	s.pending[job.ID] = job
	s.mu.Unlock()
	job.Status = common.StatusRunning
	job.StartTime = lib.TimeNow()
	if err := s.save(job); err != nil {
		return err
	}
	s.next()
	return nil
}

func (s *Scheduler) watchDone() {
	resp, err := s.client.Get(context.Background(), common.DonePrefix, clientv3.WithPrefix())
	if err != nil {
		s.logger.Errorf("%v", err)
	} else {
		for i := range resp.Kvs {
			key, val, job := string(resp.Kvs[i].Key), resp.Kvs[i].Value, common.Job{}
			if err := json.Unmarshal(val, &job); err == nil {
				if _, err := s.client.Delete(context.Background(), key); err == nil {
					s.logger.Debugf("job %d done with status: %s", job.ID, job.GetStatus())
					s.mu.Lock()
					delete(s.pending, job.ID)
					s.mu.Unlock()
					s.next()
				} else {
					s.logger.Errorf("error deleting job %d from done", job.ID)
				}
			} else {
				s.logger.Errorf("error unmarshaling job: %v", err)
			}
		}
	}

	go func() {
		wch := s.client.Watch(context.Background(), common.DonePrefix, clientv3.WithPrefix())
		for n := range wch {
			for _, ev := range n.Events {
				switch ev.Type {
				case mvccpb.PUT:
					key, val, job := string(ev.Kv.Key), ev.Kv.Value, &common.Job{}
					if err := json.Unmarshal(val, &job); err == nil {
						if _, err := s.client.Delete(context.Background(), key); err == nil {
							s.mu.Lock()
							if j, ok := s.pending[job.ID]; ok {
								job.Log = j.Log
							}
							s.mu.Unlock()
							if err := s.save(job); err == nil {
								s.logger.Debugf("job %d done with status: %s", job.ID, job.GetStatus())
								s.mu.Lock()
								delete(s.pending, job.ID)
								worker := s.workers[job.WorkerID]
								worker.running--
								worker.emitUsage()
								s.mu.Unlock()
								s.next()
							} else {
								s.logger.Errorf("error saving job %d to db", job.ID)
							}
						} else {
							s.logger.Errorf("error deleting job %d from done", job.ID)
						}
					} else {
						s.logger.Errorf("error unmarshaling job: %v", err)
					}
				}
			}
		}
	}()
}

func (s *Scheduler) queueLen() int {
	resp, err := s.client.Get(context.Background(), common.QueuePrefix, clientv3.WithPrefix())
	if err != nil {
		s.logger.Errorf("%v", err)
	}
	return len(resp.Kvs)
}

func (s *Scheduler) jobLogs(workerID string, jobID, buildID uint) {
	if worker, ok := s.workers[workerID]; ok {
		if err := worker.logOutput(context.Background(), jobID, buildID); err != nil {
			s.logger.Errorf("error streaming logs for job %d: %v", jobID, err)
		}
	}
}

func (s *Scheduler) next() {
	select {
	case s.ready <- struct{}{}:
	default:
	}
}

func (s *Scheduler) save(job *common.Job) error {
	jobModel := &model.Job{
		ID:        job.ID,
		Status:    job.GetStatus(),
		StartTime: job.StartTime,
		EndTime:   job.EndTime,
		Log:       strings.Join(job.Log, ""),
	}
	_, err := s.app.repo.Job.Update(jobModel)
	if err != nil {
		return err
	}
	go s.broadcastJobStatus(job)
	return s.app.updateBuildTime(job.BuildID)
}

func (s *Scheduler) broadcastJobStatus(job *common.Job) {
	sub := path.Join("/subs", "jobs", fmt.Sprintf("%d", job.BuildID))
	event := map[string]interface{}{
		"build_id": job.BuildID,
		"job_id":   job.ID,
		"status":   job.GetStatus(),
	}
	if job.StartTime != nil {
		event["start_time"] = job.StartTime
	}
	if job.EndTime != nil {
		event["end_time"] = job.EndTime
	}
	s.app.ws.App.Broadcast(sub, event)
}
