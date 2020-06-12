package auth

import (
	"fmt"
	"strconv"

	"github.com/dgrijalva/jwt-go"
	"golang.org/x/crypto/bcrypt"
)

// UserJWT defines structure for generating JWT based on user.
type UserJWT struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	Fullname string `json:"fullname"`
	Avatar   string `json:"avatar"`
	Admin    bool   `json:"admin"`
}

// HashPassword generates encrypted password from password string
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	return string(bytes), err
}

// CheckPasswordHash compares password string with encrypted hash.
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// GenerateJWT generates JSON Web Token
func GenerateJWT(user UserJWT) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":       user.ID,
		"email":    user.Email,
		"fullname": user.Fullname,
		"avatar":   user.Avatar,
		"admin":    user.Admin,
	})

	return token.SignedString(JWTSecret)
}

// GetUserIDFromJWT returns users ID from token.
func GetUserIDFromJWT(tokenString string) (uint, error) {
	var userID uint
	if tokenString == "" {
		return userID, fmt.Errorf("invalid token")
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}

		return JWTSecret, nil
	})
	if err != nil {
		return userID, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		id, err := strconv.Atoi(claims["id"].(string))
		if err != nil {
			return userID, err
		}
		return uint(id), nil
	}

	return userID, fmt.Errorf("user id not found")
}

// GetUserDataFromJWT returns users data included in token.
func GetUserDataFromJWT(tokenString string) (int, string, string, string, bool, error) {
	if tokenString == "" {
		return 0, "", "", "", false, fmt.Errorf("invalid token")
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}

		return JWTSecret, nil
	})
	if err != nil {
		return 0, "", "", "", false, fmt.Errorf("invalid token")
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		userID, err := strconv.Atoi(claims["id"].(string))
		if err != nil {
			return 0, "", "", "", false, fmt.Errorf("could not parse user id")
		}
		return userID, claims["email"].(string), claims["fullname"].(string), claims["avatar"].(string), claims["admin"].(bool), nil
	}

	return 0, "", "", "", false, fmt.Errorf("invalid token")
}

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
