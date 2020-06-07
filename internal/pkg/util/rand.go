package util

import (
	"math/rand"
	"time"
)

// RandomInt returns random integer in range.
func RandomInt(min, max int) int {
	rand.Seed(time.Now().UnixNano())
	return rand.Intn(max-min) + min
}
