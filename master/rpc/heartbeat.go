package rpc

import (
	"context"

	"github.com/golang/protobuf/ptypes/empty"
)

func (c *Client) Heartbeat(ctx context.Context) error {
	stream, err := c.cli.Heartbeat(ctx)
	if err != nil {
		return err
	}
	defer stream.CloseSend()
	c.logger.Infof("initialized heartbeat")

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
