package server

import (
	pb "github.com/bleenco/abstruse/proto"
)

const workerID = "3PZJACK-CTNATVU-5D3EWEF-F7PIPLE-STU4XUQ-EK66A2X-2ZCJIGX-MALTKAY"

// MainScheduler is exported main scheduler.
var MainScheduler *Scheduler

// Scheduler represents main master server scheduler.
type Scheduler struct {
}

func init() {
	MainScheduler = NewScheduler()
}

// NewScheduler returns instance of Scheduler.
func NewScheduler() *Scheduler {
	return &Scheduler{}
}

// SendJobTask triggers job task call.
func (s *Scheduler) SendJobTask() error {
	jobTask := &pb.JobTask{
		Name:     "abstruse_job_256_512",
		Code:     pb.JobTask_Start,
		Commands: []string{"git clone https://github.com/jkuri/d3-bundle.git --depth 1", "ls -alh"},
	}

	registryItem, err := MainGRPCServer.registry.Find(workerID)
	if err != nil {
		return err
	}

	if registryItem.JobProcessStream != nil {
		if err := registryItem.JobProcessStream.Send(jobTask); err != nil {
			return err
		}
	}

	return nil
}
