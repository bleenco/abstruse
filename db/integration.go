package db

import (
	"errors"
	"time"
)

// Integration represents `integrations` db table.
type Integration struct {
	BaseModel

	Provider string `gorm:"not null" json:"provider"`

	GithubUsername    string `json:"github_username"`
	GithubPassword    string `json:"github_password"`
	GithubAccessToken string `json:"github_access_token"`

	UserID int `gorm:"not null" json:"users_id"`
	User   User
}

// Create method.
func (i *Integration) Create() (*Integration, error) {
	i.CreatedAt = time.Now()
	i.UpdatedAt = time.Now()

	if i.UserID == 0 {
		return i, errors.New("users_id field is nil")
	}

	err := DB.Create(i).Error
	return i, err
}
