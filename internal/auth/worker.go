package auth

import (
	"fmt"

	jwt "github.com/dgrijalva/jwt-go"
)

// GenerateWorkerJWT generates workers json web token.
func GenerateWorkerJWT(id string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"identifier": id,
	})

	return token.SignedString(JWTSecret)
}

// GetWorkerIdentifierByJWT return workers id by token string.
func GetWorkerIdentifierByJWT(token string) (string, error) {
	var id string

	if token == "" {
		return id, fmt.Errorf("invalid token")
	}

	t, err := jwt.Parse(token, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", t.Header["alg"])
		}

		return JWTSecret, nil
	})
	if err != nil {
		return id, err
	}

	if claims, ok := t.Claims.(jwt.MapClaims); ok && t.Valid {
		id = claims["identifier"].(string)
	}

	return id, nil
}
