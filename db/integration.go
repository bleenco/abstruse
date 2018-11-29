package db

import (
	"errors"
	"time"
)

// Integration represents `integrations` db table.
type Integration struct {
	BaseModel

	Provider string `gorm:"not null" json:"provider"`

	GithubUsername    string `gorm:"column:github_username" json:"-"`
	GithubPassword    string `gorm:"column:github_password" json:"-"`
	GithubAccessToken string `gorm:"column:github_access_token" json:"-"`

	Data string `gorm:"type:text" json:"data"`

	UserID int  `gorm:"not null" json:"-"`
	User   User `json:"-"`
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

// Update method.
func (i *Integration) Update() (*Integration, error) {
	i.UpdatedAt = time.Now()

	err := DB.Update(i).Error
	return i, err
}

// FindIntegrationsByUserID returns integrations belonging to user by id.
func FindIntegrationsByUserID(userID int) ([]Integration, error) {
	var integrations []Integration
	err := DB.Where("user_id = ?", userID).Find(&integrations).Error
	return integrations, err
}
