package service

import (
	"github.com/jkuri/abstruse/internal/server/db/model"
	"github.com/jkuri/abstruse/internal/server/db/repository"
)

// RepositoryService interface
type RepositoryService interface {
	Find(id, userID uint) (*model.Repository, error)
	List(userID uint) ([]model.Repository, error)
	Create(data repository.SCMRepository, provider *model.Provider) (*model.Repository, error)
}

// DefaultRepositoryService struct
type DefaultRepositoryService struct {
	repository repository.RepoRepository
}

// NewRepositoryService returns new instance of RepositoryService.
func NewRepositoryService(repository repository.RepoRepository) RepositoryService {
	return &DefaultRepositoryService{repository}
}

// Find method.
func (s *DefaultRepositoryService) Find(id, userID uint) (*model.Repository, error) {
	return s.repository.Find(id, userID)
}

// List method.
func (s *DefaultRepositoryService) List(userID uint) ([]model.Repository, error) {
	return s.repository.List((userID))
}

// Create method.
func (s *DefaultRepositoryService) Create(data repository.SCMRepository, provider *model.Provider) (*model.Repository, error) {
	return s.repository.Create(data, provider)
}
