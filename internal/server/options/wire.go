package options

import "github.com/google/wire"

// ProviderSet exports for wire dep injection.
var ProviderSet = wire.NewSet(NewOptions)
