package service

import "github.com/google/wire"

// ProviderSet exports for wire dep injeciton.
var ProviderSet = wire.NewSet(
	NewUserService,
	NewVersionService,
	NewWorkerService,
	NewBuildService,
	NewIntegrationService,
)
