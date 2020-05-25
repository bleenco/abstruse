package app

import (
	"context"
	"sync"
	"time"

	"github.com/jkuri/abstruse/internal/pkg/shared"
	pb "github.com/jkuri/abstruse/proto"
	"go.uber.org/zap"
)

// Queue of concurrently running jobs with ability to limit parallelization.
type Queue struct {
	Max     int
	Running int

	mu         sync.RWMutex
	current    chan struct{}
	jobch      chan *shared.Job
	jobs       map[uint]*shared.Job
	wg         sync.WaitGroup
	quit       chan struct{}
	capacitych chan *pb.WorkerCapacity
	logger     *zap.SugaredLogger
	app        *App
}

// NewQueue returns new instance of Queue.
func NewQueue(concurrency int, app *App, logger *zap.Logger) *Queue {
	if concurrency <= 0 {
		concurrency = 1
	}

	return &Queue{
		Max:        concurrency,
		Running:    0,
		current:    make(chan struct{}, concurrency),
		jobch:      make(chan *shared.Job),
		jobs:       make(map[uint]*shared.Job),
		wg:         sync.WaitGroup{},
		quit:       make(chan struct{}),
		capacitych: make(chan *pb.WorkerCapacity),
		logger:     logger.With(zap.String("type", "queue")).Sugar(),
		app:        app,
	}
}

// Start starts the queue.
func (q *Queue) Start() {
	q.logger.Infof("starting worker main job queue")
	q.emitCapacityData()

loop:
	for {
		select {
		case job := <-q.jobch:
			go q.process(job)
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

func (q *Queue) process(job *shared.Job) {
	if job.Task.Code == pb.JobTask_Start {
		defer q.done()
		q.add(job)
		q.logger.Infof("starting job task: %d", job.ID)
		time.Sleep(3 * time.Second)
	} else if job.Task.Code == pb.JobTask_Stop {

	} else if job.Task.Code == pb.JobTask_Restart {

	}
}

func (q *Queue) add(job *shared.Job) error {
	ctx := context.Background()
	select {
	case <-ctx.Done():
		return ctx.Err()
	case q.current <- struct{}{}:
		break
	}

	q.Running++
	q.wg.Add(1)
	q.jobs[job.ID] = job
	q.jobch <- job
	q.emitCapacityData()
	return nil
}

func (q *Queue) done() {
	<-q.current
	q.wg.Done()
	q.Running--
	q.emitCapacityData()
}

func (q *Queue) wait() {
	q.wg.Wait()
}

func (q *Queue) emitCapacityData() {
	q.mu.Lock()
	defer q.mu.Unlock()
	q.capacitych <- &pb.WorkerCapacity{Max: int32(q.Max), Running: int32(q.Running)}
}
