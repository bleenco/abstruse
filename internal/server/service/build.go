package service

import (
	"github.com/jkuri/abstruse/internal/server/app"
	"github.com/jkuri/abstruse/internal/server/db/model"
	"github.com/jkuri/abstruse/internal/server/db/repository"
)

// BuildService interface
type BuildService interface {
	StartJob() bool
	Find(id uint) (model.Build, error)
	FindAll(id uint) (model.Build, error)
	FindByRepoID(repoID uint, limit, offset int) ([]model.Build, error)
}

// DefaultBuildService comment
type DefaultBuildService struct {
	repo repository.BuildRepository
	app  *app.App
}

// NewBuildService returns new instance of BuildService
func NewBuildService(repo repository.BuildRepository, app *app.App) BuildService {
	return &DefaultBuildService{repo, app}
}

// StartJob starts some random jobs
func (s *DefaultBuildService) StartJob() bool {
	return s.app.StartJob()
}

// Find finds build by id.
func (s *DefaultBuildService) Find(id uint) (model.Build, error) {
	return s.repo.Find(id)
}

// FindAll finds build by id with preloaded jobs and repository data.
func (s *DefaultBuildService) FindAll(id uint) (model.Build, error) {
	return s.repo.FindAll(id)
}

// FindByRepoID finds builds by repo id with preloaded jobs and repo data.
func (s *DefaultBuildService) FindByRepoID(repoID uint, limit, offset int) ([]model.Build, error) {
	return s.repo.FindByRepoID(repoID, limit, offset)
}
