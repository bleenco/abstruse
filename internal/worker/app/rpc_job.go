package app

import (
	"context"
	"time"

	"github.com/jkuri/abstruse/internal/pkg/shared"
	pb "github.com/jkuri/abstruse/proto"
)

// JobProcess executes job task and returns status.
func (app *App) JobProcess(ctx context.Context, in *pb.JobTask) (*pb.JobStatus, error) {
	job := &shared.Job{ID: uint(in.GetId()), Priority: 1000, Task: in}
	app.queue.add(job)
	time.Sleep(3 * time.Second)
	return &pb.JobStatus{Id: in.GetId(), Code: pb.JobStatus_Running}, nil
}
