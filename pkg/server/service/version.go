package service

import (
	"github.com/jkuri/abstruse/pkg/version"
	"go.uber.org/zap"
)

// VersionService struct
type VersionService struct{}

// NewVersionService returns new instance of version service.
func NewVersionService(logger *zap.Logger) VersionService {
	return VersionService{}
}

// GetInfo returns version and build info.
func (s *VersionService) GetInfo() version.BuildInfo {
	return version.GetBuildInfo()
}
