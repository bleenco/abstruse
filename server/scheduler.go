package server

import (
	"context"
	"sync"

	"github.com/bleenco/abstruse/logger"
	pb "github.com/bleenco/abstruse/proto"
	"github.com/eapache/channels"
)

const workerID = "3PZJACK-CTNATVU-5D3EWEF-F7PIPLE-STU4XUQ-EK66A2X-2ZCJIGX-MALTKAY"

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

	logger *logger.Logger
}

// NewScheduler returns instance of Scheduler.
func NewScheduler(logger *logger.Logger) *Scheduler {
	scheduler := &Scheduler{
		current: channels.NewResizableChannel(),
		job:     make(chan *pb.JobTask),
		wg:      sync.WaitGroup{},
		logger:  logger,
	}
	MainScheduler = scheduler

	go scheduler.Run()
	return scheduler
}

// Run starts the scheduler.
func (s *Scheduler) Run() {
	s.logger.Infof("starting main scheduler loop...")
	s.quit = make(chan struct{})

loop:
	for {
		select {
		case job := <-s.job:
			go func(job *pb.JobTask) {
				if job.Code == pb.JobTask_Start {
					if err := s.sendJobTask(job); err != nil {
						s.logger.Debugf("error: %s", err.Error())
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

// SetSize sets total concurrency counter of scheduler.
func (s *Scheduler) SetSize(size, used int) {
	s.Total = size
	s.Used = used
	s.current.Resize(channels.BufferCap(size))
	s.logger.Debugf("capacity: [%d / %d]", s.Used, s.Total)
}

// ScheduleJobTask puts incoming job task into scheduler.
func (s *Scheduler) ScheduleJobTask(job *pb.JobTask) {
	s.job <- job
}

// FinishJobTask decreases size of used job tasks number in scheduler.
func (s *Scheduler) FinishJobTask() {
	defer s.done()
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
