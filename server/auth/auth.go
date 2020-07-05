package auth

import (
	"time"
)

var (
	jwtSecret        []byte
	jwtExpiry        time.Duration
	jwtRefreshExpiry time.Duration
)

// Init authentication constants from config.
func Init(secret string, expiry, refreshExpiry time.Duration) {
	jwtSecret = []byte(secret)
	jwtExpiry = expiry
	jwtRefreshExpiry = refreshExpiry
}
