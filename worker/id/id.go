package id

import (
	"crypto/md5"
	"fmt"
	"strings"

	"github.com/bleenco/abstruse/pkg/lib"
)

// GenerateID generates workers id.
func GenerateID() string {
	return strings.ToUpper(New([]byte(lib.ID()))[0:6])
}

// New generates a new md5 hash from given input bytes.
func New(data []byte) string {
	return fmt.Sprintf("%x", md5.Sum(data))
}
