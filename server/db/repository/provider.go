package repository

import (
	"github.com/bleenco/abstruse/server/db"
	"github.com/bleenco/abstruse/server/db/model"
)

// ProviderRepo repository.
type ProviderRepo struct{}

// NewProviderRepo returns new ProviderRepo instance.
func NewProviderRepo() ProviderRepo {
	return ProviderRepo{}
}

// Find finds providers by userID.
func (r ProviderRepo) Find(userID uint) ([]model.Provider, error) {
	var providers []model.Provider
	db, err := db.Instance()
	if err != nil {
		return providers, err
	}
	err = db.Where("user_id = ?", userID).Find(&providers).Error
	return providers, err
}

// Create inserts new provider into db.
func (r ProviderRepo) Create(data model.Provider) (model.Provider, error) {
	db, err := db.Instance()
	if err != nil {
		return data, err
	}
	err = db.Create(&data).Error
	return data, err
}
