package app

import (
	"context"

	pb "github.com/jkuri/abstruse/proto"
)

// JobProcess executes job task and returns status.
func (app *App) JobProcess(ctx context.Context, in *pb.JobTask) (*pb.JobStatus, error) {
	return &pb.JobStatus{Id: in.GetId(), Code: pb.JobStatus_Running}, nil
}
