package rpc

import (
	"context"
	"encoding/json"
	"time"

	"github.com/jkuri/abstruse/pkg/utils"
)

// Usage represents worker usage stats.
type Usage struct {
	CertID    string    `json:"-"`
	CPU       int32     `json:"cpu"`
	Mem       int32     `json:"mem"`
	Timestamp time.Time `json:"timestamp"`
}

// UsageStats gRPC stream.
func (w *Worker) UsageStats(ctx context.Context) error {
	stream, err := w.cli.UsageStats(ctx)
	if err != nil {
		return err
	}
	defer stream.CloseSend()

	for {
		stats, err := stream.Recv()
		if err != nil {
			return err
		}
		usage := Usage{
			CertID:    w.host.CertID,
			CPU:       stats.GetCpu(),
			Mem:       stats.GetMem(),
			Timestamp: utils.ParseTime(stats.GetTimestamp()),
		}
		_, err = json.Marshal(&usage)
		if err != nil {
			return err
		}

		w.usage = append(w.usage, usage)
		if len(w.usage) > 60 {
			w.usage = w.usage[1:]
		}
	}
}
