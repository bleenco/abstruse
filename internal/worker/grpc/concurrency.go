package grpc

import (
	"context"

	"github.com/golang/protobuf/ptypes/empty"
	pb "github.com/jkuri/abstruse/proto"
)

// Concurrency gRPC service.
func (s *Server) Concurrency(ctx context.Context, in *empty.Empty) (*pb.ConcurrencyStatus, error) {
	return &pb.ConcurrencyStatus{
		Max:     uint64(s.scheduler.Max),
		Current: uint64(s.scheduler.Current),
	}, nil
}
