package app

import "github.com/google/wire"

// ProviderSet export.
var ProviderSet = wire.NewSet(NewApp)
