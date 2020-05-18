package service

import (
	"github.com/jkuri/abstruse/internal/pkg/version"
	"go.uber.org/zap"
)

type VersionService interface {
	GetInfo() version.BuildInfo
}

type DefaultVersionService struct {
	logger *zap.SugaredLogger
}

func NewVersionService(logger *zap.Logger) VersionService {
	return &DefaultVersionService{
		logger: logger.With(zap.String("type", "VersionService")).Sugar(),
	}
}

func (s *DefaultVersionService) GetInfo() version.BuildInfo {
	return version.GetBuildInfo()
}
