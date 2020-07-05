package repository

import (
	"fmt"

	"github.com/ractol/ractol/server/auth"
	"github.com/ractol/ractol/server/db"
	"github.com/ractol/ractol/server/db/model"
)

// UserRepo repository.
type UserRepo struct{}

// NewUserRepo returns new UserRepo instance.
func NewUserRepo() UserRepo {
	return UserRepo{}
}

// Find returns user by id or error if not exists.
func (r UserRepo) Find(ID uint) (model.User, error) {
	var user model.User
	db, err := db.Instance()
	if err != nil {
		return user, err
	}
	err = db.Model(&user).Where("id = ?", ID).First(&user).Error
	return user, err
}

// FindByEmail returns user based on email or error if not exists.
func (r UserRepo) FindByEmail(email string) (model.User, error) {
	var user model.User
	db, err := db.Instance()
	if err != nil {
		return user, err
	}
	err = db.Model(&user).Where("email = ?", email).First(&user).Error
	return user, err
}

// Login checks user credentials and returns user model, token and refresh token
// or error if invalid credentials.
func (r UserRepo) Login(email, password string) (model.User, string, string, error) {
	var token, refreshToken string
	user, err := r.FindByEmail(email)
	if err != nil {
		return user, token, refreshToken, err
	}

	if auth.CheckPasswordHash(password, user.Password) {
		token, err = generateToken(user)
		if err != nil {
			return user, token, refreshToken, err
		}

		refreshToken, err = generateRefreshToken(user)
		return user, token, refreshToken, err
	}

	return user, token, refreshToken, fmt.Errorf("Invalid credentials")
}

func generateToken(user model.User) (string, error) {
	payload := auth.Payload{
		ID:     user.ID,
		Email:  user.Email,
		Name:   user.Name,
		Avatar: user.Avatar,
		Admin:  user.Admin,
	}

	return auth.GenerateToken(payload)
}

func generateRefreshToken(user model.User) (string, error) {
	payload := auth.Payload{
		ID:     user.ID,
		Email:  user.Email,
		Name:   user.Name,
		Avatar: user.Avatar,
		Admin:  user.Admin,
	}

	return auth.GenerateRefreshToken(payload)
}
