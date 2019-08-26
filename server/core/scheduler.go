package core

import (
	"context"
	"sync"
	"time"

	"github.com/eapache/channels"
	"github.com/bleenco/abstruse/pkg/logger"
	pb "github.com/bleenco/abstruse/proto"
	"github.com/pkg/errors"
)

// MainScheduler is exported main scheduler.
var MainScheduler *Scheduler

// Scheduler represents main master server scheduler.
type Scheduler struct {
	Total int
	Used  int

	current *channels.ResizableChannel
	job     chan *JobTask
	wg      sync.WaitGroup
	quit    chan struct{}

	processes []*JobTask
	queue     *Queue

	logger *logger.Logger
}

// JobTask defines job task.
type JobTask struct {
	task *pb.JobTask

	ContainerID      string
	ContainerName    string
	WorkerIdentifier string

	buildID uint
	jobID   uint

	Status    string
	Log       []string
	StartTime time.Time
	EndTime   time.Time
}

// NewScheduler returns instance of Scheduler.
func NewScheduler(l *logger.Logger) *Scheduler {
	scheduler := &Scheduler{
		current: channels.NewResizableChannel(),
		job:     make(chan *JobTask),
		wg:      sync.WaitGroup{},
		queue: &Queue{
			nodes:  make([]*JobTask, 100),
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
			go func(job *JobTask) {
				if job.task.Code == pb.JobTask_Start {
					if err := s.sendJobTask(job); err != nil {
						defer s.done()
						s.logger.Debugf(err.Error())
						s.queue.Push(job)
					}
				} else if job.task.Code == pb.JobTask_Stop {

				} else if job.task.Code == pb.JobTask_Restart {

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
		s.ScheduleJobTask(jobTask.task, jobTask.buildID, jobTask.jobID)
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
func (s *Scheduler) ScheduleJobTask(job *pb.JobTask, buildID, jobID uint) {
	jobTask := &JobTask{
		task:    job,
		buildID: buildID,
		jobID:   jobID,
	}

	s.logger.Debugf("scheduling job task %s", jobTask.task.GetName())
	s.processes = append(s.processes, jobTask)
	s.job <- jobTask
}

// FinishJobTask decreases size of used job tasks number in scheduler.
func (s *Scheduler) FinishJobTask(job *JobTask) {
	defer s.done()
	var index int

	for i, jobTask := range s.processes {
		if jobTask.ContainerID == job.ContainerID && jobTask.ContainerName == job.ContainerName {
			index = i
			break
		}
	}

	timeDiff := time.Time{}.Add(job.EndTime.Sub(job.StartTime)).Format("15:04:05")
	s.logger.Debugf("finishing job task %s with status %s [time: %s]", job.task.GetName(), job.Status, timeDiff)
	s.processes = append(s.processes[:index], s.processes[index+1:]...)
}

// AppendLog appends output log for running job.
func (s *Scheduler) AppendLog(containerID, containerName, log string) error {
	proc, err := s.findJobProcess(containerName)
	if err != nil {
		return err
	}
	proc.Log = append(proc.Log, log)
	return nil
}

func (s *Scheduler) findJobProcess(containerName string) (*JobTask, error) {
	for _, proc := range s.processes {
		if proc.task.GetName() == containerName {
			return proc, nil
		}
	}

	return &JobTask{}, errors.New("job process not found")
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

func (s *Scheduler) sendJobTask(job *JobTask) error {
	s.add()

	workerID := s.getWorker()
	registryItem, err := MainGRPCServer.registry.Find(workerID)
	if err != nil {
		return err
	}

	if registryItem.JobProcessStream != nil {
		s.logger.Debugf("sending job task %s to worker %s", job.task.GetName(), workerID)
		if err := registryItem.JobProcessStream.Send(job.task); err != nil {
			return err
		}
	}

	return nil
}

func (s *Scheduler) getWorker() string {
	var workerID string
	var max int

	for id, item := range MainGRPCServer.registry.Items {
		diff := item.Capacity - item.CapacityUsed
		if diff > max {
			max = diff
			workerID = id
		}
	}

	return workerID
}

// Queue defines FIFO job task buffer.
type Queue struct {
	nodes  []*JobTask
	size   int
	head   int
	tail   int
	count  int
	logger *logger.Logger
}

// Push adds a node to the queue.
func (q *Queue) Push(n *JobTask) {
	if q.head == q.tail && q.count > 0 {
		nodes := make([]*JobTask, len(q.nodes)+q.size)
		copy(nodes, q.nodes[q.head:])
		copy(nodes[len(q.nodes)-q.head:], q.nodes[:q.head])
		q.head = 0
		q.tail = len(q.nodes)
		q.nodes = nodes
	}
	q.nodes[q.tail] = n
	q.tail = (q.tail + 1) % len(q.nodes)
	q.count++
	q.logger.Debugf("job task %s saved to buffer [%d jobs in buffer]", n.task.Name, q.count)
}

// Pop removes and returns a node from the queue in first to last order.
func (q *Queue) Pop() *JobTask {
	if q.count == 0 {
		return nil
	}
	node := q.nodes[q.head]
	q.head = (q.head + 1) % len(q.nodes)
	q.count--
	q.logger.Debugf("returning job task %s from buffer [%d jobs in buffer]", node.task.Name, q.count)
	return node
}
