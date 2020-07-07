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

// Update updates user with specified non-empty fields provided.
func (r UserRepo) Update(data model.User) (model.User, error) {
	db, err := db.Instance()
	if err != nil {
		return data, err
	}
	err = db.Model(&data).Updates(&data).Error
	return data, err
}

// Login checks user credentials and returns user model, token and refresh token
// or error if invalid credentials.
func (r UserRepo) Login(email, password string) (model.User, error) {
	user, err := r.FindByEmail(email)
	if err != nil {
		return user, err
	}

	if auth.CheckPasswordHash(password, user.Password) {
		return user, nil
	}

	return user, fmt.Errorf("Invalid credentials")
}

// AdminExists returns boolean response if user with admin role exists or not.
func (r UserRepo) AdminExists() (bool, error) {
	db, err := db.Instance()
	if err != nil {
		return false, err
	}

	var user model.User
	return !db.Where("role = ?", "admin").First(&user).RecordNotFound(), nil
}
