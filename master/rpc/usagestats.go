package rpc

import (
	"context"
	"fmt"
)

// UsageStats gRPC stream.
func (c *Client) UsageStats(ctx context.Context) error {
	stream, err := c.CLI.UsageStats(ctx)
	if err != nil {
		return err
	}
	defer stream.CloseSend()

	for {
		stats, err := stream.Recv()
		if err != nil {
			return err
		}
		fmt.Printf("%+v", stats)
	}
}
