package lib

import (
	"crypto/rand"
	"fmt"
)

// RandomString returns random string.
func RandomString() string {
	b := make([]byte, 4)
	rand.Read(b)
	return fmt.Sprintf("%x", b)
}
