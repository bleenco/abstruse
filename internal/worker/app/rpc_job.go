package app

import (
	"context"

	"github.com/jkuri/abstruse/internal/pkg/job"
	pb "github.com/jkuri/abstruse/proto"
)

// JobProcess executes job task and returns status.
func (app *App) JobProcess(ctx context.Context, in *pb.JobTask) (*pb.JobStatus, error) {
	job := &job.Job{ID: in.GetId(), Priority: 1000}
	if err := app.queue.add(job); err != nil {
		return &pb.JobStatus{Id: in.GetId(), Code: pb.JobStatus_Errored}, err
	}
	return &pb.JobStatus{Id: in.GetId(), Code: pb.JobStatus_Running}, nil
}
