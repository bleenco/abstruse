package grpc

import "github.com/google/wire"

// ProviderSet export.
var ProviderSet = wire.NewSet(NewOptions, NewApp, NewClient)
