package utils

import (
	"time"
)

// CheckCorrectDate checks datetime value.
func CheckDBDateTime(t *time.Time) bool {
	if t == nil || t.IsZero() {
		return false
	}
	return true
}