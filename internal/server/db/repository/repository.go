package repository

import "github.com/google/wire"

// ProviderSet export.
var ProviderSet = wire.NewSet(NewDBUserRepository)
