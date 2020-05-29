package controller

import "github.com/google/wire"

// ProviderSet exports for wire dependency injection.
var ProviderSet = wire.NewSet(
	NewUserController,
	NewVersionController,
	NewWorkerController,
	NewBuildController,
	NewMiddlewareController,
	NewIntegrationController,
	NewRepositoryController,
	NewProviderController,
	CreateInitControllersFn,
)
