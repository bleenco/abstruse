package rpc

import (
	"context"

	"github.com/golang/protobuf/ptypes/empty"
)

// Heartbeat gRPC stream.
func (w *Worker) Heartbeat(ctx context.Context) error {
	stream, err := w.cli.Heartbeat(ctx)
	if err != nil {
		return err
	}
	defer stream.CloseSend()
	w.log.Debugf("initialized heartbeat to worker %s %s", w.host.CertID, w.conn.Target())

	for {
		_, err := stream.Recv()
		if err != nil {
			return err
		}

		if err := stream.Send(&empty.Empty{}); err != nil {
			return err
		}
	}
}
