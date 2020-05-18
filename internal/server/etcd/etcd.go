package etcd

import "github.com/google/wire"

// ProviderSet export.
var ProviderSet = wire.NewSet(NewOptions, NewServer)
