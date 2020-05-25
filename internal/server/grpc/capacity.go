package grpc

import (
	"context"

	"github.com/golang/protobuf/ptypes/empty"
)

// WorkerCapacityStatus gRPC stream.
func (w *Worker) WorkerCapacityStatus(ctx context.Context) error {
	stream, err := w.cli.WorkerCapacityStatus(ctx, &empty.Empty{})
	if err != nil {
		return err
	}
	defer stream.CloseSend()
	w.logger.Debugf("initialized capacity status from worker %s %s", w.ID, w.addr)

	for {
		data, err := stream.Recv()
		if err != nil {
			return err
		}

		w.Max, w.Running = data.GetMax(), data.GetRunning()
		w.app.Scheduler.SetSize(w.app.getWorkersCapacityData())
	}
}
