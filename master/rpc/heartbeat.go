package rpc

import (
	"context"

	"github.com/golang/protobuf/ptypes/empty"
)

// Heartbeat gRPC stream.
func (c *Client) Heartbeat(ctx context.Context) error {
	stream, err := c.CLI.Heartbeat(ctx)
	if err != nil {
		return err
	}
	defer stream.CloseSend()
	c.logger.Debugf("initialized heartbeat to worker %s %s", c.ID, c.Conn.Target())

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
