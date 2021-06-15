package core

import "github.com/bleenco/abstruse/internal/auth"

type (
	// User represents user of the system.
	User struct {
		ID       uint    `gorm:"primary_key;auto_increment;not null" json:"id"`
		Email    string  `gorm:"not null;size:255;unique_index" json:"email"`
		Password string  `gorm:"not null;size:255;column:password" json:"-"`
		Name     string  `gorm:"not null;size:255;unique_index" json:"name"`
		Avatar   string  `gorm:"not null;size:255;default:'/assets/images/avatars/avatar_1.svg'" json:"avatar"`
		Role     string  `gorm:"not null;size:20;default:'user'" json:"role"`
		Active   bool    `gorm:"not null;default:true" json:"active"`
		Teams    []*Team `gorm:"many2many:team_users;" json:"teams"`
		Timestamp
	}

	// UserStore defines operations for working with users.
	UserStore interface {
		// Find returns a user from the datastore.
		Find(uint) (*User, error)

		// FindEmail returns a user from the datastore by email.
		FindEmail(string) (*User, error)

		// FindName returns a user from the datastore by username.
		FindName(string) (*User, error)

		// FindEmailOrName returns a user from the datastore by email or username.
		FindEmailOrName(string) (*User, error)

		// List returns a list of users from datastore.
		List() ([]*User, error)

		// Create persists a new user to the datastore.
		Create(*User) error

		// Update persists updated user to the datastore.
		Update(*User) error

		// UpdatePassword persists new user password to the datastore.
		UpdatePassword(uint, string, string) error

		// Delete deletes a user from the datastore.
		Delete(*User) error

		// Login checks user credentials and returns true if valid.
		Login(string, string) bool

		// AdminExists checks and returns if admin user exists in datastore.
		AdminExists() bool
	}
)

// Claims returns the token claims to be signed.
func (u User) Claims() auth.UserClaims {
	return auth.UserClaims{
		ID:     u.ID,
		Email:  u.Email,
		Name:   u.Name,
		Avatar: u.Avatar,
		Role:   u.Role,
	}
}
