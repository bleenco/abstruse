package service

import (
	"github.com/jkuri/abstruse/internal/server/db/model"
	"github.com/jkuri/abstruse/internal/server/db/repository"
	"go.uber.org/zap"
)

// IntegrationService interface
type IntegrationService interface {
	Find(UserID uint) ([]*model.Integration, error)
	Create(data repository.IntegrationData) (*model.Integration, error)
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
func (s *DefaultIntegrationService) Find(UserID uint) ([]*model.Integration, error) {
	return s.repository.Find(UserID)
}

// Create method
func (s *DefaultIntegrationService) Create(data repository.IntegrationData) (*model.Integration, error) {
	return s.repository.Create(data)
}
