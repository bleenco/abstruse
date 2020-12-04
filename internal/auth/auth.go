package auth

import (
	"fmt"
	"os"
)

// JWT is exposed JWT authenticator with middlewares
// to verify access tokens.
var JWT *JWTAuth

var (
	// JWTSecret secred from config for signing tokens.
	JWTSecret []byte
)

// Init authentication constants from config.
func Init(secret string) {
	JWTSecret = []byte(secret)
	JWT = NewJWTAuth("HS256")
}

func fatal(msg interface{}) {
	fmt.Println(msg)
	os.Exit(1)
}
