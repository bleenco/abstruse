package repository

import "github.com/google/wire"

// ProviderSet exports for wire dependency injection.
var ProviderSet = wire.NewSet(
	NewDBUserRepository,
	NewDBIntegrationRepository,
	NewDBRepoRepository,
)
