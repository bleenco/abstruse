package grpc

import (
	"context"

	pb "github.com/jkuri/abstruse/proto"
)

// JobProcess executes job task and returns status.
func (s *Server) JobProcess(ctx context.Context, in *pb.JobTask) (*pb.JobStatus, error) {
	return &pb.JobStatus{Id: in.GetId(), Code: pb.JobStatus_Running}, nil
}
