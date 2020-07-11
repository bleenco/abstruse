package repository

import (
	"fmt"

	"github.com/bleenco/abstruse/server/auth"
	"github.com/bleenco/abstruse/server/db"
	"github.com/bleenco/abstruse/server/db/model"
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

// UpdatePassword updates new password if current password is correct.
func (r UserRepo) UpdatePassword(userID uint, currentPassword, newPassword string) error {
	user, err := r.Find(userID)
	if err != nil {
		return err
	}

	if !auth.CheckPasswordHash(currentPassword, user.Password) {
		return fmt.Errorf("invalid current password")
	}

	password, err := auth.HashPassword(newPassword)
	if err != nil {
		return err
	}
	user.Password = password

	db, err := db.Instance()
	if err != nil {
		return err
	}

	return db.Model(&user).Updates(user).Error
}

// Create adds new user into database.
func (r UserRepo) Create(data UserForm) (model.User, error) {
	user := model.User{
		Email:  data.Email,
		Name:   data.Name,
		Avatar: data.Avatar,
		Role:   data.Role,
		Active: data.Active,
	}
	password, err := auth.HashPassword(data.Password)
	if err != nil {
		return user, err
	}
	user.Password = password

	db, err := db.Instance()
	if err != nil {
		return user, err
	}

	err = db.Create(&user).Error
	return user, err
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

// UserForm defines struct for creating and updating users.
type UserForm struct {
	ID       uint   `json:"id,omitempty"`
	Email    string `json:"email"`
	Name     string `json:"name"`
	Avatar   string `json:"avatar"`
	Password string `json:"password"`
	Role     string `json:"role"`
	Active   bool   `json:"active"`
}
