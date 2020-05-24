package grpc

import (
	"context"

	"github.com/jkuri/abstruse/internal/pkg/job"
	pb "github.com/jkuri/abstruse/proto"
)

// StartJob sends job task to start job.
func (w *Worker) StartJob(ctx context.Context, j *job.Job) (*pb.JobStatus, error) {
	job := &pb.JobTask{
		Id:          j.ID,
		Url:         "https://github.com/jkuri/d3-bundle",
		Credentials: "",
		Code:        pb.JobTask_Start,
	}
	status, err := w.cli.JobProcess(ctx, job)
	if err != nil {
		w.logger.Debugf("job %d status: %+v", j.ID, status)
	}
	return status, err
}
