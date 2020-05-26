package grpc

import (
	"fmt"
	"path"
	"sync"

	"github.com/golang/protobuf/ptypes"
	"github.com/jkuri/abstruse/internal/pkg/shared"

	"github.com/eapache/channels"
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
	jobch       chan *pb.JobTask
	queuech     chan *pb.JobTask
	processes   map[uint64]*pb.JobTask
	queue       *recipe.PriorityQueue
	donech      chan bool
	app         *App
	logger      *zap.SugaredLogger
}

// NewScheduler returns new instance of Scheduler.
func NewScheduler(app *App, logger *zap.Logger) *Scheduler {
	return &Scheduler{
		concurrency: channels.NewResizableChannel(),
		jobch:       make(chan *pb.JobTask),
		queuech:     make(chan *pb.JobTask),
		processes:   make(map[uint64]*pb.JobTask),
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
				var job *pb.JobTask
				if perr := jsoniter.UnmarshalFromString(data, &job); perr == nil {
					s.jobch <- job
				}
			}
		}
	}()

	for {
		select {
		case job := <-s.queuech:
			go func(job *pb.JobTask) {
				if data, err := jsoniter.MarshalToString(job); err == nil {
					s.queue.Enqueue(data, uint16(job.Priority))
				}
			}(job)
		case job := <-s.jobch:
			go func(job *pb.JobTask) {
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

func (s *Scheduler) stop() {
	go func() { s.donech <- true }()
}

func (s *Scheduler) setSize(max, running int32) {
	s.max, s.running = max, running
	s.concurrency.Resize(channels.BufferCap(max))
	s.logger.Debugf("capacity: [%d / %d]", s.running, s.max)
}

func (s *Scheduler) scheduleJobTask(job *pb.JobTask) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.logger.Infof("scheduling job task %d", job.Id)
	s.processes[job.Id] = job
	s.queuech <- job
}

func (s *Scheduler) startJobTask(job *pb.JobTask) error {
	worker := s.getWorker()
	if worker != nil {
		job.StartTime = ptypes.TimestampNow()
		if err := worker.JobProcess(job); err != nil {
			return err
		}
	} else {
		return fmt.Errorf("worker not found")
	}
	return nil
}

func (s *Scheduler) finishJobTask(job *pb.JobTask) {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.processes, job.Id)
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
