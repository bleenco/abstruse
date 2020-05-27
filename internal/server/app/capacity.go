package app

import (
	"context"
)

// Capacity gRPC
func (w *Worker) Capacity(ctx context.Context) error {
	stream, err := w.cli.Capacity(ctx)
	if err != nil {
		return err
	}
	defer stream.CloseSend()
	for {
		data, err := stream.Recv()
		if err != nil {
			return err
		}
		w.Max, w.Running = int32(data.GetMax()), int32(data.GetRunning())
		w.app.Scheduler.SetSize(w.app.getCapacity())
	}
}
