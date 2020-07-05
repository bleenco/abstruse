package auth

import (
	"time"
)

// JWT is exposed JWT authenticator with middlewares
// to verify access and refresh tokens.
var JWT *JWTAuth

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
	JWT = NewJWTAuth("HS256")
}
