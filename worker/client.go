package worker

import (
	"time"
)

// UploadStats defines basic upload statistics.
type UploadStats struct {
	StartedAt  time.Time
	FinishedAt time.Time
	BytesSent  int64
}
