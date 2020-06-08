package util

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

// ParseTime returns time.Time from string.
func ParseTime(str string) time.Time {
	t, err := time.Parse("2006-01-02 15:04:05", str)
	if err != nil {
		return time.Now()
	}
	return t
}

// TimeNow returns current datetime.
func TimeNow() *time.Time {
	return func(t time.Time) *time.Time { return &t }(time.Now())
}
