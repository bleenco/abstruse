package user

import (
	"fmt"

	"github.com/bleenco/abstruse/internal/auth"
	"github.com/bleenco/abstruse/server/core"
	"github.com/jinzhu/gorm"
)

// New returns a new UserStore.
func New(db *gorm.DB) core.UserStore {
	return userStore{db}
}

type userStore struct {
	db *gorm.DB
}

func (s userStore) Find(id uint) (*core.User, error) {
	var user core.User
	err := s.db.Model(&user).Preload("Teams").Where("id = ?", id).First(&user).Error
	return &user, err
}

func (s userStore) FindEmail(email string) (*core.User, error) {
	var user core.User
	err := s.db.Model(&user).Preload("Teams").Where("email = ?", email).First(&user).Error
	return &user, err
}

func (s userStore) List() ([]*core.User, error) {
	var users []*core.User
	err := s.db.Model(users).Preload("Teams").Find(&users).Error
	return users, err
}

func (s userStore) Create(user *core.User) error {
	hash, err := auth.HashPassword(auth.Password{Password: user.Password})
	if err != nil {
		return err
	}
	user.Password = hash

	return s.db.Create(user).Error
}

func (s userStore) Update(user *core.User) error {
	return s.db.Model(user).Updates(&user).Error
}

func (s userStore) UpdatePassword(id uint, curr, password string) error {
	user, err := s.Find(id)
	if err != nil {
		return err
	}

	if !auth.CheckPasswordHash(curr, user.Password) {
		return fmt.Errorf("invalid current password")
	}

	hash, err := auth.HashPassword(auth.Password{Password: password})
	if err != nil {
		return err
	}
	user.Password = hash

	return s.Update(user)
}

func (s userStore) Delete(user *core.User) error {
	return s.db.Delete(&user).Error
}

func (s userStore) Login(email, password string) bool {
	user, err := s.FindEmail(email)
	if err != nil {
		return false
	}

	return auth.CheckPasswordHash(password, user.Password)
}

func (s userStore) AdminExists() bool {
	var user core.User
	return !s.db.Where("role = ?", "admin").First(&user).RecordNotFound()
}
