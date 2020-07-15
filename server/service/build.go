package service

import (
	"github.com/bleenco/abstruse/server/core"
	"github.com/bleenco/abstruse/server/db/model"
	"github.com/bleenco/abstruse/server/db/repository"
)

// BuildService is builds service.
type BuildService struct {
	buildRepo repository.BuildRepo
	jobRepo   repository.JobRepo
	app       *core.App
}

// NewBuildService returns new instance of BuildService.
func NewBuildService(app *core.App) BuildService {
	return BuildService{
		buildRepo: repository.NewBuildRepo(),
		jobRepo:   repository.NewJobRepo(),
		app:       app,
	}
}

// TriggerBuild triggers new build for given repository ID.
func (s *BuildService) TriggerBuild(repoID, userID uint) error {
	return s.app.TriggerBuild(repoID, userID)
}

// RestartBuild restarts build by ID.
func (s *BuildService) RestartBuild(buildID uint) error {
	return s.app.RestartBuild(buildID)
}

// StopBuild stops running build.
func (s *BuildService) StopBuild(buildID uint) error {
	_, err := s.app.StopBuild(buildID)
	return err
}

// RestartJob restarts job by ID.
func (s *BuildService) RestartJob(jobID uint) error {
	return s.app.RestartJob(jobID)
}

// StopJob stops running job by ID.
func (s *BuildService) StopJob(jobID uint) error {
	return s.app.StopJob(jobID)
}

// FindJob finds job by ID.
func (s *BuildService) FindJob(jobID uint) (*model.Job, error) {
	return s.jobRepo.Find(jobID)
}
