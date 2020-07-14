package auth

import (
	"fmt"

	jwt "github.com/dgrijalva/jwt-go"
)

// UserClaims represent the claims parsed from JWT access token.
type UserClaims struct {
	ID       uint   `json:"id"`
	Email    string `json:"email"`
	Name     string `json:"name"`
	Location string `json:"location"`
	Avatar   string `json:"avatar"`
	Role     string `json:"role"`
	jwt.StandardClaims
}

// ParseClaims parses JWT claims into UserClaims.
func (c *UserClaims) ParseClaims(claims jwt.MapClaims) error {
	id, ok := claims["id"]
	if !ok {
		return fmt.Errorf("could not parse id claim")
	}
	c.ID = uint(id.(float64))

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

	location, ok := claims["location"]
	if !ok {
		return fmt.Errorf("could not parse location claim")
	}
	c.Location = location.(string)

	avatar, ok := claims["avatar"]
	if !ok {
		return fmt.Errorf("could not parse email claim")
	}
	c.Avatar = avatar.(string)

	role, ok := claims["role"]
	if !ok {
		return fmt.Errorf("could not parse email claim")
	}
	c.Role = role.(string)

	return nil
}

// RefreshClaims represents the claims parsed from JWT refresh token.
type RefreshClaims struct {
	ID    uint   `json:"id"`
	Token string `json:"token"`
	jwt.StandardClaims
}

// ParseClaims parses JWT claims into RefreshClaims.
func (c *RefreshClaims) ParseClaims(claims jwt.MapClaims) error {
	id, ok := claims["id"]
	if !ok {
		return fmt.Errorf("could not parse id claim")
	}
	c.ID = uint(id.(float64))

	token, ok := claims["token"]
	if !ok {
		return fmt.Errorf("could not parse token claim")
	}
	c.Token = token.(string)

	return nil
}
