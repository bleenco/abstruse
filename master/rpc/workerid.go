package rpc

import (
	"context"

	"github.com/golang/protobuf/ptypes/empty"
)

// WorkerID returns worker id.
func (c *Client) WorkerID(ctx context.Context) (string, error) {
	wid, err := c.CLI.WorkerID(ctx, &empty.Empty{})
	return wid.GetId(), err
}
