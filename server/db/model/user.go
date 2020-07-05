package model

import (
	"time"

	"github.com/ractol/ractol/server/auth"
)

// User defines `users` database table.
type User struct {
	ID        uint      `gorm:"primary_key;auto_increment;not null" json:"id"`
	Email     string    `gorm:"not null;varchar(255);unique_index" json:"email"`
	Password  string    `gorm:"not null;varchar(255);column:password" json:"-"`
	Name      string    `gorm:"not null;varchar(255)" json:"name"`
	Avatar    string    `gorm:"not null;varchar(255);default:'/assets/images/avatars/avatar_1.svg'" json:"avatar"`
	Role      string    `gorm:"not null;default:'user'" json:"role"`
	Active    bool      `gorm:"not null;default:true" json:"active"`
	LastLogin time.Time `json:"lastLogin"`
	TimestampModel
}

// Claims returns the token claims to be signed.
func (u *User) Claims() auth.UserClaims {
	return auth.UserClaims{
		ID:     u.ID,
		Email:  u.Email,
		Name:   u.Name,
		Avatar: u.Avatar,
		Role:   u.Role,
	}
}

// IsActive returns boolean if user is capable of logging in.
func (u *User) IsActive() bool {
	return u.Active
}
