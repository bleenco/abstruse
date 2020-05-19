package grpc

import (
	"context"

	pb "github.com/jkuri/abstruse/proto"
)

// StartJob sends job task to start job.
func (w *Worker) StartJob(ctx context.Context, id uint64) (*pb.JobStatus, error) {
	job := &pb.JobTask{
		Id:          id,
		Url:         "https://github.com/jkuri/d3-bundle",
		Credentials: "",
		Code:        pb.JobTask_Start,
	}
	status, err := w.cli.JobProcess(ctx, job)
	if err != nil {
		w.logger.Debugf("job %d status: %+v", id, status)
	}
	return status, err
}
