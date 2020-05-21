package grpc

import (
	"context"

	"github.com/golang/protobuf/ptypes/empty"
	pb "github.com/jkuri/abstruse/proto"
)

// Concurrency gRPC service.
func (s *Server) Concurrency(ctx context.Context, in *empty.Empty) (*pb.ConcurrencyStatus, error) {
	max, current := s.scheduler.Concurrency()
	return &pb.ConcurrencyStatus{
		Max:     uint64(max),
		Current: uint64(current),
	}, nil
}
