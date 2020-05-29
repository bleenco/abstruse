package service

import (
	"github.com/jkuri/abstruse/internal/server/db/model"
	"github.com/jkuri/abstruse/internal/server/db/repository"
)

// ProviderService interface
type ProviderService interface {
	List(UserID uint) ([]model.Provider, error)
	Create(data repository.ProviderForm) (*model.Provider, error)
	Update(data repository.ProviderForm) (*model.Provider, error)
}

// DefaultProviderService struct
type DefaultProviderService struct {
	repo repository.ProviderRepository
}

// NewProviderService returns new instance of ProviderService.
func NewProviderService(repo repository.ProviderRepository) ProviderService {
	return &DefaultProviderService{repo}
}

// List method.
func (s *DefaultProviderService) List(UserID uint) ([]model.Provider, error) {
	return s.repo.List(UserID)
}

// Create method.
func (s *DefaultProviderService) Create(data repository.ProviderForm) (*model.Provider, error) {
	return s.repo.Create(data)
}

// Update method.
func (s *DefaultProviderService) Update(data repository.ProviderForm) (*model.Provider, error) {
	return s.repo.Update(data)
}
