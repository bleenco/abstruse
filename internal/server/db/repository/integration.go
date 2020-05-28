package repository

import (
	"time"

	"github.com/jinzhu/gorm"
	"github.com/jkuri/abstruse/internal/server/db/model"
	"go.uber.org/zap"
)

// IntegrationRepository interface
type IntegrationRepository interface {
	Find(ID, UserID uint) (*model.Integration, error)
	Create(Provider, URL, APIURL, Username, Password, AccessToken string, UserID uint) (*model.Integration, error)
}

// DBIntegrationRepository struct
type DBIntegrationRepository struct {
	logger *zap.Logger
	db     *gorm.DB
}

// NewDBIntegrationRepository returns new DBIntegrationRepository intsance.
func NewDBIntegrationRepository(logger *zap.Logger, db *gorm.DB) IntegrationRepository {
	return &DBIntegrationRepository{
		logger: logger.With(zap.String("type", "IntegrationRepository")),
		db:     db,
	}
}

// Find returns integration based by input id and user_id.
func (r *DBIntegrationRepository) Find(ID, UserID uint) (*model.Integration, error) {
	integration := &model.Integration{}
	err := r.db.Model(integration).
		Where("id = ? AND user_id = ?", ID, UserID).
		First(integration).Error
	return integration, err
}

// Create creates new integration.
func (r *DBIntegrationRepository) Create(
	Provider, URL, APIURL, Username, Password, AccessToken string, UserID uint,
) (*model.Integration, error) {
	integration := &model.Integration{
		Provider:    Provider,
		URL:         URL,
		APIURL:      APIURL,
		Username:    Username,
		Password:    Password,
		AccessToken: AccessToken,
		UserID:      UserID,
	}
	integration.CreatedAt = time.Now()
	integration.UpdatedAt = time.Now()
	err := r.db.Create(integration).Error
	return integration, err
}
