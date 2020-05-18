package etcd

import (
	"github.com/google/wire"
)

// ProviderSet wire exports.
var ProviderSet = wire.NewSet(NewClient, NewApp, NewOptions)
