package lib

import (
	"github.com/google/uuid"
)

// ID returns new uuid in string format.
func ID() string {
	return uuid.New().String()
}
