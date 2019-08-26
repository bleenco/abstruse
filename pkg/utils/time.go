package utils

import (
	"time"
)

// FormatTime returns DB compatible datetime string.
func FormatTime(t time.Time) string {
	if t.IsZero() {
		return ""
	}

	return t.Format("2006-01-02 15:04:05")
}