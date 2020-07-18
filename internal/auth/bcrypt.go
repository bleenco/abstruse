package auth

import (
	"golang.org/x/crypto/bcrypt"
)

// Password defines password to be hashed.
type Password struct {
	Password string
	Cost     int
}

// HashPassword generates encrypted password from password string
func HashPassword(passwd Password) (string, error) {
	if passwd.Cost == 0 {
		passwd.Cost = bcrypt.MaxCost
	}
	bytes, err := bcrypt.GenerateFromPassword([]byte(passwd.Password), passwd.Cost)
	return string(bytes), err
}

// CheckPasswordHash compares password string with encrypted hash.
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
