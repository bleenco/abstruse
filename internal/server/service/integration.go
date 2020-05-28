package service

import (
	"github.com/jkuri/abstruse/internal/server/db/model"
	"github.com/jkuri/abstruse/internal/server/db/repository"
	"go.uber.org/zap"
)

// IntegrationService interface
type IntegrationService interface {
	Find(ID, UserID uint) (*model.Integration, error)
	Create(Provider, URL, APIURL, Username, Password, AccessToken string, UserID uint) (*model.Integration, error)
}

// DefaultIntegrationService struct
type DefaultIntegrationService struct {
	logger     *zap.SugaredLogger
	repository repository.IntegrationRepository
}

// NewIntegrationService returns new instance of DefaultIntegrationRepository.
func NewIntegrationService(logger *zap.Logger, repository repository.IntegrationRepository) IntegrationService {
	return &DefaultIntegrationService{
		logger:     logger.With(zap.String("type", "IntegrationService")).Sugar(),
		repository: repository,
	}
}

// Find method.
func (s *DefaultIntegrationService) Find(ID, UserID uint) (*model.Integration, error) {
	return s.repository.Find(ID, UserID)
}

// Create method
func (s *DefaultIntegrationService) Create(Provider, URL, APIURL, Username, Password, AccessToken string, UserID uint) (*model.Integration, error) {
	return s.repository.Create(Provider, URL, APIURL, Username, Password, AccessToken, UserID)
}
