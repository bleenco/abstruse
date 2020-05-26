package service

import (
	"github.com/jkuri/abstruse/internal/server/app"
	"go.uber.org/zap"
)

// BuildService interface
type BuildService interface {
	StartJob() bool
}

// DefaultBuildService comment
type DefaultBuildService struct {
	logger *zap.SugaredLogger
	app    *app.App
}

// NewBuildService returns new instance of BuildService
func NewBuildService(logger *zap.Logger, app *app.App) BuildService {
	return &DefaultBuildService{
		logger: logger.With(zap.String("type", "BuildService")).Sugar(),
		app:    app,
	}
}

// StartJob starts some random jobs
func (s *DefaultBuildService) StartJob() bool {
	return s.app.StartJob()
}
