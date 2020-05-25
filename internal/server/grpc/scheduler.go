package grpc

import (
	"context"
	"path"
	"sync"
	"time"

	"github.com/eapache/channels"
	"github.com/jkuri/abstruse/internal/pkg/shared"
	jsoniter "github.com/json-iterator/go"
	"go.etcd.io/etcd/clientv3"
	recipe "go.etcd.io/etcd/contrib/recipes"
	"go.uber.org/zap"
)

var (
	queueNS = path.Join(shared.ServicePrefix, "jobs", "queue")
)

// Scheduler is main job/task queue and scheduler.
type Scheduler struct {
	mu         sync.RWMutex
	Max        int32
	Running    int32
	current    *channels.ResizableChannel
	wg         sync.WaitGroup
	workch     chan *shared.Job
	schedulech chan *shared.Job
	quit       chan struct{}
	queue      *recipe.PriorityQueue
	jobs       map[uint]*shared.Job
	logger     *zap.SugaredLogger
	app        *App
	client     *clientv3.Client
}

// NewScheduler returns new instance of Scheduler.
func NewScheduler(app *App, logger *zap.Logger) *Scheduler {
	return &Scheduler{
		current:    channels.NewResizableChannel(),
		workch:     make(chan *shared.Job),
		schedulech: make(chan *shared.Job),
		wg:         sync.WaitGroup{},
		jobs:       make(map[uint]*shared.Job),
		logger:     logger.With(zap.String("type", "scheduler")).Sugar(),
		app:        app,
		quit:       make(chan struct{}),
	}
}

// Start starts the scheduler.
func (s *Scheduler) Start(client *clientv3.Client) error {
	s.logger.Infof("starting main scheduler")
	s.client = client
	s.queue = recipe.NewPriorityQueue(client, queueNS)
	go s.runQueue()

loop:
	for {
		select {
		case job := <-s.schedulech:
			go s.enqueue(job)
		case job := <-s.workch:
			go s.startJob(job)
		case <-s.quit:
			break loop
		}
	}

	s.wg.Wait()
	return nil
}

// Stop stops the scheduler.
func (s *Scheduler) Stop() {
	go func() {
		close(s.quit)
	}()
}

// ScheduleJob schedules new job task.
func (s *Scheduler) ScheduleJob(job *shared.Job) {
	s.logger.Debugf("scheduling job task %d", job.ID)
	s.mu.Lock()
	defer s.mu.Unlock()
	s.jobs[job.ID] = job
	s.schedulech <- job
}

// FinishJob decreases size of used job tasks in scheduler.
func (s *Scheduler) FinishJob(job *shared.Job) {
	defer s.done()
	timeDiff := time.Time{}.Add(job.EndTime.Sub(job.StartTime)).Format("15:04:05")
	s.logger.Debugf("job %d done with status %s [time: %s]", job.ID, job.Status, timeDiff)
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.jobs, job.ID)
}

// SetSize sets max concurrency of a sheduler.
func (s *Scheduler) SetSize(max, running int32) {
	s.mu.Lock()
	s.Running = running
	s.Max = max
	s.mu.Unlock()
	if max > 0 {
		s.current.Resize(channels.BufferCap(int(max)))
	}
	s.logger.Debugf("capacity: [%d / %d]", s.Running, s.Max)
}

func (s *Scheduler) startJob(job *shared.Job) {
	worker := s.findWorker()
	s.logger.Debugf("sending job %d to worker %s", job.ID, worker.ID)
	_, err := worker.StartJob(context.Background(), job)
	if err != nil {
		s.logger.Errorf("error processing job %d: %v", job.ID, err)
	}
	job.EndTime = time.Now()
	s.FinishJob(job)
}

func (s *Scheduler) runQueue() {
	for {
		job, err := s.dequeue()
		if err != nil {
			s.logger.Errorf("error getting job from queue: %v", err)
		} else {
			s.add()
			s.workch <- job
		}
	}
}

func (s *Scheduler) enqueue(job *shared.Job) {
	data := job.String()
	if err := s.queue.Enqueue(data, job.Priority); err != nil {
		s.logger.Errorf("could not put job %d into the queue", job.ID)
	}
}

func (s *Scheduler) dequeue() (*shared.Job, error) {
	var j shared.Job
	data, err := s.queue.Dequeue()
	if err != nil {
		return &j, err
	}
	if err := jsoniter.UnmarshalFromString(data, &j); err != nil {
		s.logger.Errorf("could not unmarshal data")
		return &j, err
	}
	return &j, nil
}

func (s *Scheduler) add() {
	select {
	case s.current.In() <- struct{}{}:
	default:
	}

	s.wg.Add(1)
	s.Running++
}

func (s *Scheduler) done() {
	<-s.current.Out()
	s.wg.Done()
	s.Running--
}

func (s *Scheduler) findWorker() *Worker {
	var w *Worker
	var max int32

	for _, worker := range s.app.GetWorkers() {
		diff := worker.Max - worker.Running
		if diff > max {
			max = diff
			w = worker
		}
	}
	if w == nil {
		w = <-s.app.WorkerReady
	}

	return w
}
