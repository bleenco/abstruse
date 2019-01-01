package worker

import (
	"github.com/bleenco/abstruse/worker/id"
	jwt "github.com/dgrijalva/jwt-go"
)

// GenerateWorkerJWT generates workers json web token.
func GenerateWorkerJWT(identifier id.ID, secret string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"identifier": identifier.String(),
	})

	return token.SignedString([]byte(secret))
}
