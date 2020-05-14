package rpc

import (
	"context"
	"time"

	"github.com/jkuri/abstruse/pkg/utils"
)

// Usage represents worker usage stats.
type Usage struct {
	CertID    string    `json:"cert_id"`
	CPU       int32     `json:"cpu"`
	Mem       int32     `json:"mem"`
	Timestamp time.Time `json:"timestamp"`
}

// UsageStats gRPC stream.
func (c *Client) UsageStats(ctx context.Context, uch chan<- *Usage) error {
	stream, err := c.CLI.UsageStats(ctx)
	if err != nil {
		return err
	}
	defer stream.CloseSend()
	defer close(uch)

	for {
		stats, err := stream.Recv()
		if err != nil {
			return err
		}
		uch <- &Usage{
			CertID:    c.Host.CertID,
			CPU:       stats.GetCpu(),
			Mem:       stats.GetMem(),
			Timestamp: utils.ParseTime(stats.GetTimestamp()),
		}
	}
}
