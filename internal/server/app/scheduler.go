package app

import (
	"context"
	"path"
	"sync"

	"github.com/jkuri/abstruse/internal/core"
	"github.com/jkuri/abstruse/internal/pkg/shared"
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
	logger  *zap.SugaredLogger
	ctx     context.Context
}

// NewScheduler returns a new Scheduler instance.
func NewScheduler(client *clientv3.Client, logger *zap.Logger) Scheduler {
	return Scheduler{
		ready:   make(chan struct{}, 1),
		client:  client,
		queue:   recipe.NewPriorityQueue(client, shared.QueuePrefix),
		workers: make(map[string]*Worker),
		logger:  logger.With(zap.String("type", "scheduler")).Sugar(),
		ctx:     context.Background(),
	}
}

// Start starts the scheduler.
func (q Scheduler) Start() error {
	q.wdelch = q.watchWorkers()
	q.jobch = q.dequeue()
	go q.watchDone()

	for {
		select {
		case <-q.ctx.Done():
			return q.ctx.Err()
		case <-q.ready:
			q.process()
		}
	}
}

// Schedule adds new job for execution in queue with priority.
func (q Scheduler) Schedule(job core.Job) error {
	job.Status = core.StatusQueued
	val, err := jsoniter.MarshalToString(&job)
	if err != nil {
		return err
	}
	if err = q.queue.Enqueue(val, job.Priority); err != nil {
		return err
	}
	q.logger.Debugf("job %d scheduled in the queue with priority %d", job.ID, job.Priority)
	q.next()
	return nil
}

// Pause pauses jobs in the queue waiting for execution.
func (q Scheduler) Pause() error {
	q.mu.Lock()
	defer q.mu.Unlock()
	q.paused = true
	return nil
}

// Resume unpauses scheduler and continues with jobs
// waiting for execution.
func (q Scheduler) Resume() error {
	q.mu.Lock()
	q.paused = false
	q.mu.Unlock()
	q.next()
	return nil
}

// AddWorker adds worker to schedulers worker list.
func (q Scheduler) AddWorker(w *Worker) {
	q.mu.Lock()
	defer q.mu.Unlock()
	q.workers[w.id] = w
	q.logger.Debugf("worker %s added to scheduler list", w.id)
}

// DeleteWorker removes worker from schedulers worker list.
func (q Scheduler) DeleteWorker(id string) {
	q.mu.Lock()
	defer q.mu.Unlock()
	delete(q.workers, id)
	q.logger.Debugf("worker %s deleted from scheduler list", id)
}

// Cancel stops job if pending or removes from queue.
func (q Scheduler) Cancel(id uint) error {
	return nil
}

func (q Scheduler) process() error {
	q.mu.Lock()
	count := len(q.workers)
	pause := q.paused
	q.mu.Unlock()
	if pause || count == 0 {
		return nil
	}

	var worker *Worker
	var c int
	q.mu.Lock()
	for _, w := range q.workers {
		w.mu.Lock()
		count := w.max - w.running
		if count > c {
			worker, c = w, count
		}
		w.mu.Unlock()
	}
	q.mu.Unlock()
	if c == 0 {
		return nil
	}

	select {
	case job := <-q.jobch:
		worker.mu.Lock()
		worker.running++
		worker.mu.Unlock()
		q.logger.Debugf("worker %s capacity: %d", worker.id, worker.Capacity())
		job.WorkerID = worker.id
		q.logger.Debugf("job %d enqueued, sending to worker %s...", job.ID, job.WorkerID)
		worker.StartJob(job)
	case wid := <-q.wdelch:
		if wid == worker.id {
			return nil
		}
	}

	return nil
}

func (q Scheduler) dequeue() <-chan core.Job {
	ch := make(chan core.Job)

	go func() {
		for {
			data, err := q.queue.Dequeue()
			if err != nil {
				q.logger.Errorf("error while dequeue: %v", err)
				return
			}
			job := core.Job{}
			if err := jsoniter.UnmarshalFromString(data, &job); err != nil {
				q.logger.Errorf("error while unmarshaling job: %v", err)
				return
			}
			ch <- job
		}
	}()

	return ch
}

func (q Scheduler) watchDone() {
	go func() {
		resp, err := q.client.Get(context.Background(), shared.DonePrefix, clientv3.WithPrefix())
		if err != nil {
			q.logger.Errorf("%v", err)
		} else {
			for i := range resp.Kvs {
				key, val, job := string(resp.Kvs[i].Key), string(resp.Kvs[i].Value), core.Job{}
				if err := jsoniter.UnmarshalFromString(val, &job); err == nil {
					if _, err := q.client.Delete(context.Background(), key); err == nil {
						q.logger.Debugf("job %d done with status: %s", job.ID, job.GetStatus())
						q.next()
					} else {
						q.logger.Errorf("error deleting job %d from done", job.ID)
					}
				} else {
					q.logger.Errorf("error unmarshaling job: %v", err)
				}
			}
		}
	}()

	go func() {
		wch := q.client.Watch(context.Background(), shared.DonePrefix, clientv3.WithPrefix())
		for n := range wch {
			for _, ev := range n.Events {
				switch ev.Type {
				case mvccpb.PUT:
					key := string(ev.Kv.Key)
					job := core.Job{}
					if err := jsoniter.UnmarshalFromString(string(ev.Kv.Value), &job); err == nil {
						worker := q.workers[job.WorkerID]
						worker.mu.Lock()
						worker.running--
						worker.mu.Unlock()
						if _, err := q.client.Delete(context.Background(), key); err == nil {
							q.logger.Debugf("job %d done with status: %s", job.ID, job.GetStatus())
							q.next()
						} else {
							q.logger.Errorf("error deleting job %d from done", job.ID)
						}
					} else {
						q.logger.Errorf("error unmarshaling job: %v", err)
					}
				}
			}
		}
	}()
}

func (q Scheduler) watchWorkers() <-chan string {
	ch := make(chan string)

	go func() {
		prefix := path.Join(shared.ServicePrefix, shared.WorkerService)
		rch := q.client.Watch(context.Background(), prefix, clientv3.WithPrefix())
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

func (q Scheduler) next() {
	select {
	case q.ready <- struct{}{}:
	default:
	}
}
