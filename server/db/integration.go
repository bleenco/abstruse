package db

import (
	"errors"
	"time"
)

// Integration represents `integrations` db table.
type Integration struct {
	BaseModel

	Provider string `gorm:"not null" json:"provider"`

	GithubURL         string `gorm:"column:github_url" json:"github_url"`
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
		return i, errors.New("user_id field is nil")
	}

	err := DB.Create(i).Error
	return i, err
}

// Find method.
func (i *Integration) Find(integrationID, userID int) (Integration, error) {
	var integration Integration
	err := DB.Where("user_id = ? AND id = ?", userID, integrationID).Find(&integration).Error
	return integration, err
}

// Update method.
func (i *Integration) Update() (*Integration, error) {
	err := DB.Model(i).Update(map[string]interface{}{"updated_at": time.Now(), "data": i.Data}).Error
	return i, err
}

// FindIntegrationsByUserID returns integrations belonging to user by id.
func FindIntegrationsByUserID(userID int) ([]Integration, error) {
	var integrations []Integration
	err := DB.Where("user_id = ?", userID).Find(&integrations).Error
	return integrations, err
}
