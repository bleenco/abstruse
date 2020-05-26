package service

import (
	"github.com/jkuri/abstruse/internal/pkg/version"
	"go.uber.org/zap"
)

// VersionService interface
type VersionService interface {
	GetInfo() version.BuildInfo
}

// DefaultVersionService struct
type DefaultVersionService struct {
	logger *zap.SugaredLogger
}

// NewVersionService returns new instance of version service.
func NewVersionService(logger *zap.Logger) VersionService {
	return &DefaultVersionService{
		logger: logger.With(zap.String("type", "VersionService")).Sugar(),
	}
}

// GetInfo returns version and build info.
func (s *DefaultVersionService) GetInfo() version.BuildInfo {
	return version.GetBuildInfo()
}
