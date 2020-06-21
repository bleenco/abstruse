package service

import (
	"github.com/jkuri/abstruse/pkg/server/db/model"
	"github.com/jkuri/abstruse/pkg/server/db/repository"
)

// RepositoryService struct
type RepositoryService struct {
	repository repository.RepoRepository
}

// NewRepositoryService returns new instance of RepositoryService.
func NewRepositoryService(repository repository.RepoRepository) RepositoryService {
	return RepositoryService{repository}
}

// Find method.
func (s *RepositoryService) Find(id, userID uint) (*model.Repository, error) {
	return s.repository.Find(id, userID)
}

// FindByURL method.
func (s *RepositoryService) FindByURL(url string) (model.Repository, error) {
	return s.repository.FindByURL(url)
}

// List method.
func (s *RepositoryService) List(userID uint) ([]model.Repository, error) {
	return s.repository.List((userID))
}

// Search method.
func (s *RepositoryService) Search(keyword string) ([]model.Repository, error) {
	return s.repository.Search(keyword)
}

// Create method.
func (s *RepositoryService) Create(data repository.SCMRepository, provider *model.Provider) (*model.Repository, error) {
	return s.repository.Create(data, provider)
}
