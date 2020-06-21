package service

import (
	"github.com/jkuri/abstruse/pkg/server/app"
	"github.com/jkuri/abstruse/pkg/server/db/model"
	"github.com/jkuri/abstruse/pkg/server/db/repository"
)

// BuildService comment
type BuildService struct {
	repo    repository.BuildRepository
	jobRepo repository.JobRepository
	app     *app.App
}

// NewBuildService returns new instance of BuildService
func NewBuildService(repo repository.BuildRepository, jobRepo repository.JobRepository, app *app.App) BuildService {
	return BuildService{repo, jobRepo, app}
}

// TriggerBuild triggers build for repository.
func (s *BuildService) TriggerBuild(repoID, userID uint) error {
	return s.app.TriggerBuild(repoID, userID)
}

// StopBuild stops the build and related jobs.
func (s *BuildService) StopBuild(id uint) bool {
	if _, err := s.app.StopBuild(id); err != nil {
		return false
	}
	return true
}

// RestartBuild restarts the build.
func (s *BuildService) RestartBuild(id uint) bool {
	if err := s.app.RestartBuild(id); err != nil {
		return false
	}
	return true
}

// StopJob stops the job if running.
func (s *BuildService) StopJob(id uint) bool {
	if err := s.app.StopJob(id); err != nil {
		return false
	}
	return true
}

// RestartJob restart the job.
func (s *BuildService) RestartJob(id uint) bool {
	if err := s.app.RestartJob(id); err != nil {
		return false
	}
	return true
}

// Find finds build by id.
func (s *BuildService) Find(id uint) (model.Build, error) {
	return s.repo.Find(id)
}

// FindAll finds build by id with preloaded jobs and repository data.
func (s *BuildService) FindAll(id uint) (model.Build, error) {
	return s.repo.FindAll(id)
}

// FindBuilds finds builds with preloaded jobs and repo data.
func (s *BuildService) FindBuilds(limit, offset int) ([]model.Build, error) {
	return s.repo.FindBuilds(limit, offset)
}

// FindByRepoID finds builds by repo id with preloaded jobs and repo data.
func (s *BuildService) FindByRepoID(repoID uint, limit, offset int) ([]model.Build, error) {
	return s.repo.FindByRepoID(repoID, limit, offset)
}

// FindJob finds job by id.
func (s *BuildService) FindJob(id uint) (*model.Job, error) {
	job, err := s.jobRepo.Find(id)
	if err != nil {
		return job, err
	}
	if job.Status == "running" {
		job.Log = s.app.GetCurrentJobLog(job.ID)
	}
	return job, nil
}
