package worker

import (
	"context"
	"sync"

	"github.com/bleenco/abstruse/pkg/logger"
	pb "github.com/bleenco/abstruse/proto"
)

// Queue of concurrently started jobs with ability to limit parallelization.
type Queue struct {
	Concurrency int
	Used        int

	current chan struct{}
	job     chan *pb.JobTask
	wg      sync.WaitGroup
	quit    chan struct{}

	logger *logger.Logger
}

// NewQueue returns new instance of Queue
func NewQueue(concurrency int, log *logger.Logger) *Queue {
	if concurrency <= 0 {
		concurrency = 1
	}

	return &Queue{
		Concurrency: concurrency,
		Used:        0,
		current:     make(chan struct{}, concurrency),
		job:         make(chan *pb.JobTask),
		wg:          sync.WaitGroup{},
		quit:        make(chan struct{}),
		logger:      log,
	}
}

// Run starts the queue.
func (q *Queue) Run() {
	q.logger.Infof("starting worker main queue loop")
	q.quit = make(chan struct{})
	q.sendCapacityInfo()

loop:
	for {
		select {
		case jobTask := <-q.job:
			go func(task *pb.JobTask) {
				if task.Code == pb.JobTask_Start {
					q.add()
					defer q.done()
					q.logger.Infof("starting job task: %s", jobTask.GetName())
					StartJob(task)
				} else if task.Code == pb.JobTask_Stop {
					q.logger.Infof("stopping job task: %s", jobTask.GetName())
					StopJob(task.GetName())
				} else if task.Code == pb.JobTask_Restart {

				}
				q.logger.Infof("done job task: %s", jobTask.GetName())
			}(jobTask)
		case <-q.quit:
			break loop
		}
	}

	q.wait()
}

// Stop stops the queue.
func (q *Queue) Stop() {
	go func() {
		close(q.quit)
	}()
}

func (q *Queue) add() error {
	ctx := context.Background()
	select {
	case <-ctx.Done():
		return ctx.Err()
	case q.current <- struct{}{}:
		break
	}

	q.wg.Add(1)
	q.Used++

	return q.sendCapacityInfo()
}

func (q *Queue) done() {
	<-q.current
	q.wg.Done()

	q.Used--
	q.sendCapacityInfo()
}

func (q *Queue) wait() {
	q.wg.Wait()
}

func (q *Queue) sendCapacityInfo() error {
	return WorkerProcess.Client.UpdateWorkerCapacityStatus(context.Background())
}
