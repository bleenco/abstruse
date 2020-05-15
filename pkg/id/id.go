package id

import (
	"crypto/md5"
	"fmt"
)

// New generates a new md5 hash from given input bytes.
func New(data []byte) string {
	return fmt.Sprintf("%x", md5.Sum(data))
}
