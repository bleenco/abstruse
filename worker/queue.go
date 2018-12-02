package worker

import (
	"context"
	"fmt"
	"sync"

	"github.com/bleenco/abstruse/worker/docker"
)

// Queue of concurrently started jobs with ability to limit parallelization.
type Queue struct {
	Concurrency int

	current chan struct{}
	job     chan int
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
		job:         make(chan int),
		wg:          sync.WaitGroup{},
		quit:        make(chan struct{}),
	}
}

// Run starts the queue.
func (q *Queue) Run() {
loop:
	for {
		select {
		case job := <-q.job:
			q.add()
			go func(i int) {
				defer q.done()
				name := fmt.Sprintf("jan-%d", i)
				if err := docker.RunContainer(name); err != nil {
					fmt.Println(err)
				}
			}(job)
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
