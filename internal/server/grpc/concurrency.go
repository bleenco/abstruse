package grpc

import (
	"context"

	"github.com/golang/protobuf/ptypes/empty"
	pb "github.com/jkuri/abstruse/proto"
)

// Concurrency returns current worker capacity usage.
func (w *Worker) Concurrency(ctx context.Context) (*pb.ConcurrencyStatus, error) {
	status, err := w.cli.Concurrency(ctx, &empty.Empty{})
	w.max, w.current = status.GetMax(), status.GetCurrent()
	return status, err
}
