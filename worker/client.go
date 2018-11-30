package worker

import (
	"context"
	"time"
)

// Client iface defines desired methods for gRPC client.
type Client interface {
	UploadFile(ctx context.Context, f string) (*UploadStats, error)
	Close()
}

// UploadStats defines basic upload statistics.
type UploadStats struct {
	StartedAt  time.Time
	FinishedAt time.Time
	BytesSent  int64
}
