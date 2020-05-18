package websocket

import (
	"github.com/google/wire"
)

var ProviderSet = wire.NewSet(NewServer, NewOptions, NewApp)
