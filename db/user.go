package db

import (
	"fmt"
	"strconv"
	"time"

	"github.com/bleenco/abstruse/config"
	"github.com/bleenco/abstruse/security"
	jwt "github.com/dgrijalva/jwt-go"
)

// User represents `users` database table.
type User struct {
	BaseModel

	Email    string `gorm:"not null;varchar(255);unique_index" json:"email"`
	Password string `gorm:"not null;varchar(255);column:password" json:"-"`
	Fullname string `gorm:"not null;varchar(255)" json:"fullname"`
	Avatar   string `gorm:"not null;varchar(255);default:'/assets/images/avatars/predefined/avatar_1.svg'" json:"avatar"`

	Repositories []*Repository `json:"repositories"`

	Team       []*Team       `gorm:"many2many:team_users;" json:"teams"`
	Permission []*Permission `gorm:"many2many:user_permissions;" json:"permissions"`
}

// Find finds user by id.
func (u *User) Find(id int) (*User, error) {
	err := DB.First(u, id).Error
	return u, err
}

// FindByEmail finds user by email or username.
func (u *User) FindByEmail(email string) (*User, error) {
	err := DB.First(u, "email = ?", email).Error
	return u, err
}

// Create method.
func (u *User) Create() error {
	u.UpdatedAt = time.Now()
	u.CreatedAt = time.Now()

	if err := u.hashPassword(); err != nil {
		return err
	}

	if err := DB.Create(u).Error; err != nil {
		return err
	}

	return nil
}

// CheckPassword returns bool is password is correct.
func (u *User) CheckPassword(password string) bool {
	return security.CheckPasswordHash(password, u.Password)
}

// GenerateJWT returns JSON Web Token.
func (u *User) GenerateJWT() (string, error) {
	su := security.UserJWT{
		ID:       strconv.Itoa(int(u.ID)),
		Email:    u.Email,
		Fullname: u.Fullname,
		Avatar:   u.Avatar,
	}
	return security.GenerateJWT(su)
}

// CheckUserJWT checks for validity of user JWT token.
func (u *User) CheckUserJWT(tokenString string) bool {
	if tokenString == "" {
		return false
	}

	token, _ := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}

		return []byte(config.Configuration.Security.JWTSecret), nil
	})

	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		id, _ := strconv.Atoi(claims["id"].(string))
		if _, err := u.Find(id); err != nil {
			return false
		}

		return true
	}

	return false
}

func (u *User) hashPassword() error {
	password, err := security.HashPassword(u.Password)
	if err != nil {
		return err
	}

	u.Password = password
	return nil
}
