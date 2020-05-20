package grpc

import (
	"context"
	"time"

	pb "github.com/jkuri/abstruse/proto"
)

// JobProcess executes job task and returns status.
func (s *Server) JobProcess(ctx context.Context, in *pb.JobTask) (*pb.JobStatus, error) {
	// if s.scheduler.Current >= s.scheduler.Max {
	// 	s.scheduler.WaitOnAvailable()
	// }
	if err := s.scheduler.UpdateCapacity(s.scheduler.Current + 1); err != nil {
		s.logger.Errorf("%+v", err)
	}
	time.Sleep(3 * time.Second)
	if err := s.scheduler.UpdateCapacity(s.scheduler.Current - 1); err != nil {
		s.logger.Errorf("%+v", err)
	}
	return &pb.JobStatus{Id: in.GetId(), Code: pb.JobStatus_Running}, nil
}
