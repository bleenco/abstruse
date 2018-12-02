package worker

import (
	"context"
	"sync"

	pb "github.com/bleenco/abstruse/proto"
)

// JobQueue is exported main job Queue instance.
var JobQueue *Queue

func init() {
	JobQueue = NewQueue(2)
}

// Queue of concurrently started jobs with ability to limit parallelization.
type Queue struct {
	Concurrency int

	current chan struct{}
	job     chan *pb.JobTask
	wg      sync.WaitGroup
	quit    chan struct{}
}

// NewQueue returns new instance of Queue
func NewQueue(concurrency int) *Queue {
	if concurrency <= 0 {
		concurrency = 1
	}

	return &Queue{
		Concurrency: concurrency,
		current:     make(chan struct{}, concurrency),
		job:         make(chan *pb.JobTask),
		wg:          sync.WaitGroup{},
		quit:        make(chan struct{}),
	}
}

// Run starts the queue.
func (q *Queue) Run() {
	q.quit = make(chan struct{})

loop:
	for {
		select {
		case jobTask := <-q.job:
			q.add()
			go func(task *pb.JobTask) {
				defer q.done()

				if task.Code == pb.JobTask_Start {
					StartJob(task)
				} else if task.Code == pb.JobTask_Stop {

				} else if task.Code == pb.JobTask_Restart {

				}
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
	return nil
}

func (q *Queue) done() {
	<-q.current
	q.wg.Done()
}

func (q *Queue) wait() {
	q.wg.Wait()
}
