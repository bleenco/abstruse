package db

import (
	"errors"
	"time"
)

// Integration represents `integrations` db table.
type Integration struct {
	BaseModel

	Provider string `gorm:"not null" json:"provider"`

	URL         string `gorm:"column:url" json:"url"`
	APIURL      string `gorm:"column:api_url" json:"api_url"`
	Username    string `gorm:"column:username" json:"-"`
	Password    string `gorm:"column:password" json:"-"`
	AccessToken string `gorm:"column:access_token" json:"-"`

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
	err := DB.Model(i).Update(map[string]interface{}{"updated_at": time.Now()}).Error
	return i, err
}

// FindIntegrationsByUserID returns integrations belonging to user by id.
func FindIntegrationsByUserID(userID int) ([]Integration, error) {
	var integrations []Integration
	err := DB.Where("user_id = ?", userID).Find(&integrations).Error
	return integrations, err
}
