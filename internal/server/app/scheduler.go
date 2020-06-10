package app

import (
	"context"
	"fmt"
	"path"
	"strings"
	"sync"

	"github.com/jkuri/abstruse/internal/core"
	"github.com/jkuri/abstruse/internal/pkg/shared"
	"github.com/jkuri/abstruse/internal/pkg/util"
	"github.com/jkuri/abstruse/internal/server/db/model"
	jsoniter "github.com/json-iterator/go"
	"go.etcd.io/etcd/clientv3"
	recipe "go.etcd.io/etcd/contrib/recipes"
	"go.etcd.io/etcd/mvcc/mvccpb"
	"go.uber.org/zap"
)

// Scheduler contains logic for etcd backed priority scheduler.
type Scheduler struct {
	mu      sync.Mutex
	ready   chan struct{}
	paused  bool
	client  *clientv3.Client
	queue   *recipe.PriorityQueue
	workers map[string]*Worker
	wdelch  <-chan string
	jobch   <-chan core.Job
	pending map[uint]core.Job
	logger  *zap.SugaredLogger
	app     *App
	ctx     context.Context
}

// NewScheduler returns a new Scheduler instance.
func NewScheduler(client *clientv3.Client, app *App) Scheduler {
	return Scheduler{
		ready:   make(chan struct{}, 1),
		client:  client,
		queue:   recipe.NewPriorityQueue(client, shared.QueuePrefix),
		workers: make(map[string]*Worker),
		pending: make(map[uint]core.Job),
		logger:  app.log.With(zap.String("type", "scheduler")).Sugar(),
		app:     app,
		ctx:     context.Background(),
	}
}

// Start starts the scheduler.
func (s Scheduler) Start() error {
	s.wdelch = s.watchWorkers()
	s.jobch = s.dequeue()
	go s.watchDone()

	for {
		select {
		case <-s.ctx.Done():
			return s.ctx.Err()
		case <-s.ready:
			s.process()
		}
	}
}

// Schedule adds new job for execution in queue with priority.
func (s Scheduler) Schedule(job core.Job) error {
	job.Status = core.StatusQueued
	job.StartTime = nil
	job.EndTime = nil
	if err := s.save(job); err != nil {
		return err
	}

	val, err := jsoniter.MarshalToString(&job)
	if err != nil {
		return err
	}

	if err = s.queue.Enqueue(val, job.Priority); err != nil {
		return err
	}

	s.logger.Debugf("job %d scheduled in the queue with priority %d", job.ID, job.Priority)
	s.next()
	return nil
}

// Pause pauses jobs in the queue waiting for execution.
func (s Scheduler) Pause() error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.paused = true
	return nil
}

// Resume unpauses scheduler and continues with jobs
// waiting for execution.
func (s Scheduler) Resume() error {
	s.mu.Lock()
	s.paused = false
	s.mu.Unlock()
	s.next()
	return nil
}

// Cancel stops job if pending or removes from queue.
func (s Scheduler) Cancel(id uint) error {
	resp, err := s.client.Get(context.TODO(), shared.QueuePrefix, clientv3.WithPrefix())
	if err != nil {
		return err
	}
	for i := range resp.Kvs {
		key, val, job := string(resp.Kvs[i].Key), string(resp.Kvs[i].Value), core.Job{}
		if err := jsoniter.UnmarshalFromString(val, &job); err == nil {
			if job.ID == id {
				s.logger.Debugf("removing job %d from queue...", job.ID)
				if _, err := s.client.Delete(context.TODO(), key); err != nil {
					return err
				}
				job.StartTime = util.TimeNow()
				job.EndTime = util.TimeNow()
				job.Status = core.StatusFailing
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
		s.logger.Debugf("stopping job %d...", id)
		job.EndTime = util.TimeNow()
		job.Status = core.StatusFailing
		key := path.Join(shared.StopPrefix, fmt.Sprintf("%d", job.ID))
		val, err := jsoniter.MarshalToString(&job)
		if err != nil {
			return err
		}
		if _, err := s.client.Put(context.TODO(), key, val); err != nil {
			return err
		}
		return nil
	}
	s.mu.Unlock()
	return nil
}

// AddWorker adds worker to schedulers worker list.
func (s Scheduler) AddWorker(w *Worker) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.workers[w.id] = w
	s.logger.Debugf("worker %s added to scheduler list", w.id)
}

// DeleteWorker removes worker from schedulers worker list.
func (s Scheduler) DeleteWorker(id string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.workers, id)
	s.logger.Debugf("worker %s deleted from scheduler list", id)
}

func (s Scheduler) process() error {
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
		count := w.max - w.running
		if count > c {
			worker, c = w, count
		}
		w.mu.Unlock()
	}
	s.mu.Unlock()
	if c == 0 {
		return nil
	}

	select {
	case job := <-s.jobch:
		worker.mu.Lock()
		worker.running++
		worker.mu.Unlock()
		worker.emitUsage()
		job.WorkerID = worker.id
		s.logger.Debugf("job %d enqueued, sending to worker %s...", job.ID, job.WorkerID)
		if err := s.startJob(job); err != nil {
			s.logger.Errorf("error starting job %d: %v", job.ID, err)
		}
	case wid := <-s.wdelch:
		if wid == worker.id {
			return nil
		}
	}

	return nil
}

func (s Scheduler) startJob(job core.Job) error {
	data, err := jsoniter.MarshalToString(&job)
	if err != nil {
		return err
	}
	_, err = s.app.client.Put(context.Background(), path.Join(shared.PendingPrefix, fmt.Sprintf("%d", job.ID)), data)
	if err != nil {
		return err
	}
	s.mu.Lock()
	s.pending[job.ID] = job
	s.mu.Unlock()
	job.Status = core.StatusRunning
	job.StartTime = util.TimeNow()
	if err := s.save(job); err != nil {
		return err
	}
	return nil
}

func (s Scheduler) dequeue() <-chan core.Job {
	ch := make(chan core.Job)

	go func() {
		for {
			data, err := s.queue.Dequeue()
			if err != nil {
				s.logger.Errorf("error while dequeue: %v", err)
				return
			}
			job := core.Job{}
			if err := jsoniter.UnmarshalFromString(data, &job); err != nil {
				s.logger.Errorf("error while unmarshaling job: %v", err)
				return
			}
			ch <- job
		}
	}()

	return ch
}

func (s Scheduler) watchDone() {
	resp, err := s.client.Get(context.Background(), shared.DonePrefix, clientv3.WithPrefix())
	if err != nil {
		s.logger.Errorf("%v", err)
	} else {
		for i := range resp.Kvs {
			key, val, job := string(resp.Kvs[i].Key), string(resp.Kvs[i].Value), core.Job{}
			if err := jsoniter.UnmarshalFromString(val, &job); err == nil {
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
		wch := s.client.Watch(context.Background(), shared.DonePrefix, clientv3.WithPrefix())
		for n := range wch {
			for _, ev := range n.Events {
				switch ev.Type {
				case mvccpb.PUT:
					key := string(ev.Kv.Key)
					job := core.Job{}
					if err := jsoniter.UnmarshalFromString(string(ev.Kv.Value), &job); err == nil {
						if _, err := s.client.Delete(context.Background(), key); err == nil {
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

func (s Scheduler) watchWorkers() <-chan string {
	ch := make(chan string)

	go func() {
		prefix := path.Join(shared.ServicePrefix, shared.WorkerService)
		rch := s.client.Watch(context.Background(), prefix, clientv3.WithPrefix())
		for n := range rch {
			for _, ev := range n.Events {
				switch ev.Type {
				case mvccpb.DELETE:
					ch <- path.Base(string(ev.Kv.Key))
				}
			}
		}
	}()

	return ch
}

func (s Scheduler) next() {
	select {
	case s.ready <- struct{}{}:
	default:
	}
}

func (s Scheduler) save(job core.Job) error {
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

func (s Scheduler) broadcastJobStatus(job core.Job) {
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
