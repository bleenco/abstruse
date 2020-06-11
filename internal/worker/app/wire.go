package app

import "github.com/google/wire"

// ProviderSet exports for wire dependency injection.
var ProviderSet = wire.NewSet(NewApp)
