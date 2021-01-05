package core

import (
	"time"

	"github.com/jinzhu/gorm"
)

type (
	// Provider represents `providers` db table.
	Provider struct {
		ID          uint       `gorm:"primary_key;auto_increment;not null" json:"id"`
		Name        string     `gorm:"not null" json:"name"`
		URL         string     `gorm:"not null" json:"url"`
		AccessToken string     `gorm:"not null" json:"-"`
		Secret      string     `gorm:"not null" json:"secret"`
		Host        string     `gorm:"not null" json:"host"`
		LastSync    *time.Time `json:"lastSync"`
		UserID      uint       `gorm:"not null" json:"userID"`
		User        User       `json:"user"`
		Timestamp
	}

	// ProviderStore defines operations on `providers` table.
	ProviderStore interface {
		// Find returns provider from datastore.
		Find(uint) (*Provider, error)

		// List returns providers from datastore.
		List() ([]*Provider, error)

		// ListUser returns providers from datastore based
		// by user ID.
		ListUser(uint) ([]*Provider, error)

		// Create persists a new provider to the datastore.
		Create(*Provider) error

		// Update persists updated provider to the datastore.
		Update(*Provider) error

		// Delete deletes a provider from the datastore.
		Delete(*Provider) error

		// Sync synchronizes provider repositories with local repositories.
		Sync(uint) error
	}
)

// AfterDelete hook on provider which deletes all related repositories.
func (p *Provider) AfterDelete(tx *gorm.DB) error {
	return tx.Model(&Repository{}).
		Where("provider_id = ?", p.ID).
		Delete(&Repository{}).
		Error
}
