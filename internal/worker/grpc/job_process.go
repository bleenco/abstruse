package grpc

import (
	"context"
	"fmt"
	"time"

	pb "github.com/jkuri/abstruse/proto"
)

// JobProcess executes job task and returns status.
func (s *Server) JobProcess(ctx context.Context, in *pb.JobTask) (*pb.JobStatus, error) {
	// if s.scheduler.Current >= s.scheduler.Max {
	// 	s.scheduler.WaitOnAvailable()
	// }
	max, current := s.scheduler.Concurrency()
	if max < current || current < 0 {
		return nil, fmt.Errorf("invalid concurrency data, max: %d, current: %d", max, current)
	}
	s.scheduler.UpdateConcurrency(current + 1)
	time.Sleep(3 * time.Second)
	s.scheduler.UpdateConcurrency(current - 1)
	return &pb.JobStatus{Id: in.GetId(), Code: pb.JobStatus_Running}, nil
}
