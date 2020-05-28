package service

import (
	"github.com/jkuri/abstruse/internal/server/db/model"
	"github.com/jkuri/abstruse/internal/server/db/repository"
)

// RepositoryService interface
type RepositoryService interface {
	Find(ID uint) (*model.Repository, error)
	List(UserID uint) ([]model.Repository, error)
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
func (s *DefaultRepositoryService) Find(ID uint) (*model.Repository, error) {
	return s.repository.Find(ID)
}

// List method.
func (s *DefaultRepositoryService) List(UserID uint) ([]model.Repository, error) {
	return s.repository.List((UserID))
}
