package grpc

import (
	"context"
	"time"
)

// Usage represents worker usage stats.
type Usage struct {
	ID        string    `json:"id"`
	Addr      string    `json:"addr"`
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
			ID:        w.ID,
			Addr:      w.addr,
			CPU:       stats.GetCpu(),
			Mem:       stats.GetMem(),
			Timestamp: time.Now(),
		}

		w.ws.Broadcast("/subs/workers_usage", map[string]interface{}{
			"id":        w.ID,
			"addr":      w.addr,
			"cpu":       usage.CPU,
			"mem":       usage.Mem,
			"timestamp": usage.Timestamp,
		})

		w.usage = append(w.usage, usage)
		if len(w.usage) > 60 {
			// TODO save to db.
			w.usage = w.usage[1:]
		}
	}
}
