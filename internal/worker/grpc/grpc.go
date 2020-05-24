package grpc

import "github.com/google/wire"

// ProviderSet export for wire.
var ProviderSet = wire.NewSet(NewServer)
