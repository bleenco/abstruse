package auth

import jwt "github.com/dgrijalva/jwt-go"

// GenerateWorkerJWT generates workers json web token.
func GenerateWorkerJWT(id string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"identifier": id,
	})

	return token.SignedString(JWTSecret)
}
