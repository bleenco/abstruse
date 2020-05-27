package app

import (
	"fmt"
	"path"
	"sync"
	"time"

	"github.com/eapache/channels"
	"github.com/golang/protobuf/ptypes"
	"github.com/jkuri/abstruse/internal/pkg/shared"
	pb "github.com/jkuri/abstruse/proto"
	jsoniter "github.com/json-iterator/go"
	"go.etcd.io/etcd/clientv3"
	recipe "go.etcd.io/etcd/contrib/recipes"
	"go.uber.org/zap"
)

var queueNS = path.Join(shared.ServicePrefix, shared.QueueService)

// Scheduler is main job/task queue and scheduler.
type Scheduler struct {
	mu          sync.Mutex
	max         int32
	running     int32
	concurrency *channels.ResizableChannel
	jobch       chan *Job
	queuech     chan *Job
	processes   map[uint64]*Job
	queue       *recipe.PriorityQueue
	donech      chan bool
	app         *App
	logger      *zap.SugaredLogger
}

// Job defines job/task.
type Job struct {
	ID       uint64      `json:"id"`
	BuildID  uint64      `json:"build_id"`
	WorkerID string      `json:"worker_id"`
	Log      []string    `json:"log"`
	Task     *pb.JobTask `json:"task"`
}

// NewScheduler returns new instance of Scheduler.
func NewScheduler(app *App, logger *zap.Logger) *Scheduler {
	return &Scheduler{
		concurrency: channels.NewResizableChannel(),
		jobch:       make(chan *Job),
		queuech:     make(chan *Job),
		processes:   make(map[uint64]*Job),
		donech:      make(chan bool),
		app:         app,
		logger:      logger.With(zap.String("type", "scheduler")).Sugar(),
	}
}

// Start starts the scheduler.
func (s *Scheduler) Start(client *clientv3.Client) {
	s.logger.Infof("starting main scheduler loop")
	s.queue = recipe.NewPriorityQueue(client, queueNS)

	go func() {
		for {
			if data, err := s.queue.Dequeue(); err == nil {
				var job *Job
				if perr := jsoniter.UnmarshalFromString(data, &job); perr == nil {
					s.jobch <- job
				}
			}
		}
	}()

	for {
		select {
		case job := <-s.queuech:
			go func(job *Job) {
				if data, err := jsoniter.MarshalToString(job); err == nil {
					s.queue.Enqueue(data, uint16(job.Task.Priority))
				}
			}(job)
		case job := <-s.jobch:
			go func(job *Job) {
				s.add()
				defer s.done()
				if jerr := s.startJobTask(job); jerr == nil {
					s.finishJobTask(job)
				}
			}(job)
		case <-s.donech:
			return
		}
	}
}

// Stop stops the scheduler.
func (s *Scheduler) Stop() {
	go func() { s.donech <- true }()
}

// ScheduleJobTask schedules new job task.
func (s *Scheduler) ScheduleJobTask(job *Job) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.logger.Infof("scheduling job task %d", job.ID)
	s.processes[job.ID] = job
	s.queuech <- job
}

// SetSize sets max and running variables and resizes concurrency
// channel if necessary.
func (s *Scheduler) SetSize(max, running int32) {
	s.max, s.running = max, running
	if max > 0 {
		s.concurrency.Resize(channels.BufferCap(max))
	} else {
		s.concurrency = channels.NewResizableChannel()
	}
	s.logger.Debugf("capacity: [%d / %d]", s.running, s.max)
}

func (s *Scheduler) startJobTask(job *Job) error {
	worker := s.getWorker()
	if worker != nil {
		job.Task.StartTime = ptypes.TimestampNow()
		job.WorkerID = worker.ID
		defer func() { job.Task.EndTime = ptypes.TimestampNow() }()
		if err := worker.JobProcess(job); err != nil {
			return err
		}
	} else {
		return fmt.Errorf("worker not found")
	}
	return nil
}

func (s *Scheduler) finishJobTask(job *Job) {
	s.mu.Lock()
	defer s.mu.Unlock()
	start, _ := ptypes.Timestamp(job.Task.StartTime)
	end, _ := ptypes.Timestamp(job.Task.EndTime)
	timeDiff := time.Time{}.Add(end.Sub(start)).Format("15:04:05")
	s.logger.Debugf("done job task %d [time: %s]", job.ID, timeDiff)
	delete(s.processes, job.ID)
}

func (s *Scheduler) add() {
	select {
	case s.concurrency.In() <- struct{}{}:
		break
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	s.running++
}

func (s *Scheduler) done() {
	<-s.concurrency.Out()
	s.mu.Lock()
	defer s.mu.Unlock()
	s.running--
}

func (s *Scheduler) getWorker() *Worker {
	var w *Worker
	var max int32
	s.app.mu.Lock()
	defer s.app.mu.Unlock()
	for _, worker := range s.app.workers {
		diff := worker.Max - worker.Running
		if diff > max {
			max = diff
			w = worker
		}
	}
	return w
}
