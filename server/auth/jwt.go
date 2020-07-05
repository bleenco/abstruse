package auth

import (
	"time"

	jwt "github.com/dgrijalva/jwt-go"
)

// Payload defines structure for generating JWTT based on user.
type Payload struct {
	ID     uint   `json:"id"`
	Email  string `json:"email"`
	Name   string `json:"name"`
	Avatar string `json:"avatar"`
	Role   string `json:"role"`
}

// GenerateToken generates JWT for user.
func GenerateToken(payload Payload) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":     payload.ID,
		"email":  payload.Email,
		"name":   payload.Name,
		"avatar": payload.Avatar,
		"role":   payload.Role,
		"iat":    time.Now().UTC().Unix(),
		"exp":    time.Now().UTC().Add(jwtExpiry).Unix(),
		"iss":    "Ractal CI",
	})

	return token.SignedString(jwtSecret)
}

// GenerateRefreshToken generates refresh JWT for user.
func GenerateRefreshToken(payload Payload) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":  payload.ID,
		"iat": time.Now().UTC().Unix(),
		"exp": time.Now().Add(jwtRefreshExpiry).UTC().Unix(),
		"iss": "Ractal CI",
	})

	return token.SignedString(jwtSecret)
}

// // GetRefreshTokenData returns parsed refresh token data.
// func GetRefreshTokenData(token string) (Payload, error) {
// 	var data Payload

// 	if token == "" {
// 		return data, fmt.Errorf("invalid token")
// 	}

// 	t, err := jwt.Parse(token, func(t *jwt.Token) (interface{}, error) {
// 		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
// 			return data, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
// 		}

// 		return jwtSecret, nil
// 	})
// 	if err != nil {
// 		return data, err
// 	}

// 	if claims, ok := t.Claims.(jwt.MapClaims); ok && t.Valid {
// 		if id, ok := claims["id"].(string); ok {
// 			did, err := strconv.Atoi(id)
// 			if err != nil {
// 				return data, fmt.Errorf("could not parse id key from token: %v", err)
// 			}
// 			data.ID = uint(did)
// 		} else {
// 			return data, fmt.Errorf("could not parse id key from token")
// 		}

// 		if iat, ok := claims["iat"].(string); ok {
// 			diat, err := strconv.ParseInt(iat, 10, 64)
// 			if err != nil {
// 				return data, fmt.Errorf("could not parse iat key from token: %v", err)
// 			}
// 			data.IssuedAt = time.Unix(diat, 0)
// 		} else {
// 			return data, fmt.Errorf("could not parse iat key from token")
// 		}

// 		if exp, ok := claims["exp"].(string); ok {
// 			dexp, err := strconv.ParseInt(exp, 10, 64)
// 			if err != nil {
// 				return data, fmt.Errorf("could not parse exp key from token: %v", err)
// 			}
// 			data.ExpiresAt = time.Unix(dexp, 0)
// 		} else {
// 			return data, fmt.Errorf("could not parse exp key from token")
// 		}

// 		return data, nil
// 	}

// 	return data, fmt.Errorf("invalid token or parse error")
// }
