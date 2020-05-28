package repository

import (
	"time"

	"github.com/jinzhu/gorm"
	"github.com/jkuri/abstruse/internal/server/db/model"
	"go.uber.org/zap"
)

// IntegrationRepository interface
type IntegrationRepository interface {
	Find(UserID uint) ([]model.Integration, error)
	Create(data IntegrationData) (*model.Integration, error)
}

// DBIntegrationRepository struct
type DBIntegrationRepository struct {
	logger *zap.Logger
	db     *gorm.DB
}

// IntegrationData struct
type IntegrationData struct {
	Provider    string `json:"provider"`
	URL         string `json:"url"`
	APIURL      string `json:"api_url"`
	Username    string `json:"username"`
	Password    string `json:"password"`
	AccessToken string `json:"access_token"`
	UserID      uint   `json:"user_id"`
}

// NewDBIntegrationRepository returns new DBIntegrationRepository intsance.
func NewDBIntegrationRepository(logger *zap.Logger, db *gorm.DB) IntegrationRepository {
	return &DBIntegrationRepository{
		logger: logger.With(zap.String("type", "IntegrationRepository")),
		db:     db,
	}
}

// Find returns integration based by user_id.
func (r *DBIntegrationRepository) Find(UserID uint) ([]model.Integration, error) {
	var integrations []model.Integration
	err := r.db.Where("user_id = ?", UserID).Find(&integrations).Error
	return integrations, err
}

// Create creates new integration.
func (r *DBIntegrationRepository) Create(data IntegrationData) (*model.Integration, error) {
	integration := &model.Integration{
		Provider:    data.Provider,
		URL:         data.URL,
		APIURL:      data.APIURL,
		Username:    data.Username,
		Password:    data.Password,
		AccessToken: data.AccessToken,
		UserID:      data.UserID,
	}
	integration.CreatedAt = time.Now()
	integration.UpdatedAt = time.Now()
	err := r.db.Create(integration).Error
	return integration, err
}
