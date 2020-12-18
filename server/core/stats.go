package core

import "time"

// StatsHistoryCount history units
const StatsHistoryCount = 120

type (
	// Usage defines server usage stats.
	Usage struct {
		CPU       int32     `json:"cpu"`
		Mem       int32     `json:"mem"`
		Timestamp time.Time `json:"timestamp"`
	}

	// StatsService defines operations on server statistics.
	StatsService interface {
		GetHistory() ([]Usage, []SchedulerStats)

		SchedulerStatus() bool
	}
)
