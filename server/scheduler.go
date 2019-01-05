package server

import (
	"context"
	"sync"
	"time"

	"github.com/bleenco/abstruse/pkg/logger"
	pb "github.com/bleenco/abstruse/proto"
	"github.com/eapache/channels"
	"github.com/pkg/errors"
)

// MainScheduler is exported main scheduler.
var MainScheduler *Scheduler

// Scheduler represents main master server scheduler.
type Scheduler struct {
	Total int
	Used  int

	current *channels.ResizableChannel
	job     chan *pb.JobTask
	wg      sync.WaitGroup
	quit    chan struct{}

	processes []*JobProcess
	queue     *Queue

	logger *logger.Logger
}

// JobProcess defines remote job process.
type JobProcess struct {
	ContainerID      string
	ContainerName    string
	WorkerIdentifier string

	Status string

	Log       []string
	StartTime time.Time
	EndTime   time.Time
}

// NewScheduler returns instance of Scheduler.
func NewScheduler(l *logger.Logger) *Scheduler {
	scheduler := &Scheduler{
		current: channels.NewResizableChannel(),
		job:     make(chan *pb.JobTask),
		wg:      sync.WaitGroup{},
		queue: &Queue{
			nodes:  make([]*pb.JobTask, 100),
			logger: logger.NewLogger("queue", l.Info, l.Debug),
		},
		logger: l,
	}
	MainScheduler = scheduler

	go scheduler.Run()
	return scheduler
}

// Run starts the scheduler.
func (s *Scheduler) Run() {
	s.logger.Infof("starting main scheduler loop")
	s.quit = make(chan struct{})

loop:
	for {
		select {
		case job := <-s.job:
			go func(job *pb.JobTask) {
				if job.Code == pb.JobTask_Start {
					if err := s.sendJobTask(job); err != nil {
						s.done()
						s.logger.Debugf(err.Error())
						s.queue.Push(job)
					}
				} else if job.Code == pb.JobTask_Stop {

				} else if job.Code == pb.JobTask_Restart {

				}
			}(job)
		case <-s.quit:
			break loop
		}
	}

	s.wait()
}

// Stop stops the scheduler.
func (s *Scheduler) Stop() {
	go func() {
		close(s.quit)
	}()
}

// RunQueue takes buffered job tasks from front to back and sends it forward.
func (s *Scheduler) RunQueue() {
	for s.queue.count > 0 {
		jobTask := s.queue.Pop()
		s.ScheduleJobTask(jobTask)
	}
}

// SetSize sets total concurrency counter of scheduler.
func (s *Scheduler) SetSize(size, used int) {
	s.Total = size
	s.Used = used
	if size > 0 {
		s.current.Resize(channels.BufferCap(size))
	}
	s.logger.Debugf("capacity: [%d / %d]", s.Used, s.Total)
}

// ScheduleJobTask puts incoming job task into scheduler.
func (s *Scheduler) ScheduleJobTask(job *pb.JobTask) {
	s.logger.Debugf("scheduling job task %s", job.GetName())
	s.job <- job
}

// FinishJobTask decreases size of used job tasks number in scheduler.
func (s *Scheduler) FinishJobTask() {
	defer s.done()
}

// AppendLog appends output log for running job.
func (s *Scheduler) AppendLog(containerID, containerName, log string) error {
	proc, err := s.findJobProcessByName(containerName)
	if err != nil {
		return err
	}
	proc.ContainerID = containerID

	proc.Log = append(proc.Log, log)
	return nil
}

func (s *Scheduler) findJobProcess(containerID string) (*JobProcess, error) {
	for _, proc := range s.processes {
		if proc.ContainerID == containerID {
			return proc, nil
		}
	}

	return &JobProcess{}, errors.New("job process not found")
}

func (s *Scheduler) findJobProcessByName(containerName string) (*JobProcess, error) {
	for _, proc := range s.processes {
		if proc.ContainerName == containerName {
			return proc, nil
		}
	}

	return &JobProcess{}, errors.New("job process not found")
}

func (s *Scheduler) add() error {
	ctx := context.Background()
	select {
	case <-ctx.Done():
		return ctx.Err()
	case s.current.In() <- struct{}{}:
		break
	}

	s.wg.Add(1)
	s.Used++

	return nil
}

func (s *Scheduler) done() {
	<-s.current.Out()
	s.wg.Done()

	s.Used--
}

func (s *Scheduler) wait() {
	s.wg.Wait()
}

func (s *Scheduler) sendJobTask(job *pb.JobTask) error {
	s.add()

	workerID := s.getWorker()
	registryItem, err := MainGRPCServer.registry.Find(workerID)
	if err != nil {
		return err
	}

	if registryItem.JobProcessStream != nil {
		s.logger.Debugf("sending job task %s to worker %s", job.GetName(), workerID)
		if err := registryItem.JobProcessStream.Send(job); err != nil {
			return err
		}
	}

	return nil
}

func (s *Scheduler) getWorker() string {
	var workerID string
	var max int

	for id, item := range MainGRPCServer.registry.items {
		diff := item.CapacityTotal - item.CapacityUsed
		if diff > max {
			max = diff
			workerID = id
		}
	}

	return workerID
}

// Queue defines FIFO job task buffer.
type Queue struct {
	nodes  []*pb.JobTask
	size   int
	head   int
	tail   int
	count  int
	logger *logger.Logger
}

// Push adds a node to the queue.
func (q *Queue) Push(n *pb.JobTask) {
	if q.head == q.tail && q.count > 0 {
		nodes := make([]*pb.JobTask, len(q.nodes)+q.size)
		copy(nodes, q.nodes[q.head:])
		copy(nodes[len(q.nodes)-q.head:], q.nodes[:q.head])
		q.head = 0
		q.tail = len(q.nodes)
		q.nodes = nodes
	}
	q.nodes[q.tail] = n
	q.tail = (q.tail + 1) % len(q.nodes)
	q.count++
	q.logger.Debugf("job task %s saved to buffer [%d jobs in buffer]", n.Name, q.count)
}

// Pop removes and returns a node from the queue in first to last order.
func (q *Queue) Pop() *pb.JobTask {
	if q.count == 0 {
		return nil
	}
	node := q.nodes[q.head]
	q.head = (q.head + 1) % len(q.nodes)
	q.count--
	q.logger.Debugf("returning job task %s from buffer [%d jobs in buffer]", node.Name, q.count)
	return node
}
