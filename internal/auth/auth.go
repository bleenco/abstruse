package auth

import (
	"fmt"
	"os"
	"time"
)

// JWT is exposed JWT authenticator with middlewares
// to verify access and refresh tokens.
var JWT *JWTAuth

var (
	// JWTSecret secred from config for signing tokens.
	JWTSecret []byte
	// JWTExpiry user token expiration time.
	JWTExpiry time.Duration
	// JWTRefreshExpiry refresh token expiration time.
	JWTRefreshExpiry time.Duration
)

// Init authentication constants from config.
func Init(secret string, expiry, refreshExpiry time.Duration) {
	JWTSecret = []byte(secret)
	JWTExpiry = expiry
	JWTRefreshExpiry = refreshExpiry
	JWT = NewJWTAuth("HS256")
}

// InitHtpasswd inits authentication for docker private registry.
func InitHtpasswd(filePath, user, password string) {
	if err := generateHtpasswdFile(filePath, user, password); err != nil {
		fatal(err)
	}
}

func fatal(msg interface{}) {
	fmt.Println(msg)
	os.Exit(1)
}
