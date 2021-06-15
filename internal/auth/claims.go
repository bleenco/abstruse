package auth

import (
	"fmt"

	jwt "github.com/dgrijalva/jwt-go"
)

// UserClaims represent the claims parsed from JWT access token.
type UserClaims struct {
	ID     uint   `json:"id"`
	Login  string `json:"login"`
	Email  string `json:"email"`
	Name   string `json:"name"`
	Avatar string `json:"avatar"`
	Role   string `json:"role"`
	jwt.StandardClaims
}

// ParseClaims parses JWT claims into UserClaims.
func (c *UserClaims) ParseClaims(claims jwt.MapClaims) error {
	id, ok := claims["id"]
	if !ok {
		return fmt.Errorf("could not parse id claim")
	}
	c.ID = uint(id.(float64))

	login, ok := claims["login"]
	if !ok {
		return fmt.Errorf("could not parse login claim")
	}
	c.Login = login.(string)

	email, ok := claims["email"]
	if !ok {
		return fmt.Errorf("could not parse email claim")
	}
	c.Email = email.(string)

	name, ok := claims["name"]
	if !ok {
		return fmt.Errorf("could not parse name claim")
	}
	c.Name = name.(string)

	avatar, ok := claims["avatar"]
	if !ok {
		return fmt.Errorf("could not parse avatar claim")
	}
	c.Avatar = avatar.(string)

	role, ok := claims["role"]
	if !ok {
		return fmt.Errorf("could not parse role claim")
	}
	c.Role = role.(string)

	return nil
}

// WorkerClaims represent the claims parsed from JWT access token
// on worker node connection.
type WorkerClaims struct {
	ID   string `json:"id"`
	Addr string `json:"addr"`
	jwt.StandardClaims
}

// ParseClaims parses JWT claims into WorkerClaims.
func (c *WorkerClaims) ParseClaims(claims jwt.MapClaims) error {
	id, ok := claims["id"]
	if !ok {
		return fmt.Errorf("could not parse id claim")
	}
	c.ID = id.(string)

	addr, ok := claims["addr"]
	if !ok {
		return fmt.Errorf("could not parse addr claim")
	}
	c.Addr = addr.(string)

	return nil
}
