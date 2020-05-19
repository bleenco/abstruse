package grpc

import (
	"context"
	"time"

	pb "github.com/jkuri/abstruse/proto"
)

// JobProcess executes job task and returns status.
func (s *Server) JobProcess(ctx context.Context, in *pb.JobTask) (*pb.JobStatus, error) {
	if s.scheduler.Current >= s.scheduler.Max {
		s.scheduler.WaitOnAvailable()
	}
	s.scheduler.UpdateCapacity(s.scheduler.Current + 1)
	time.Sleep(3 * time.Second)
	s.scheduler.UpdateCapacity(s.scheduler.Current - 1)
	return &pb.JobStatus{Id: in.GetId(), Code: pb.JobStatus_Running}, nil
}
