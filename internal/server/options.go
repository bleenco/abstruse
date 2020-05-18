package server

import (
	"github.com/jkuri/abstruse/internal/pkg/auth"
	"github.com/jkuri/abstruse/internal/pkg/http"
	"github.com/jkuri/abstruse/internal/pkg/log"
	"github.com/jkuri/abstruse/internal/server/db"
	"github.com/jkuri/abstruse/internal/server/etcd"
	"github.com/jkuri/abstruse/internal/server/grpc"
	"github.com/jkuri/abstruse/internal/server/websocket"
	"github.com/spf13/viper"
)

// Options are global config for the server app.
type Options struct {
	HTTP       *http.Options
	Websocket  *websocket.Options
	GRPCClient *grpc.Options
	DB         *db.Options
	Etcd       *etcd.Options
	Auth       *auth.Options
	Log        *log.Options
}

// NewOptions returns server app config.
func NewOptions(v *viper.Viper) (*Options, error) {
	opts := &Options{}
	err := v.Unmarshal(opts)
	return opts, err
}
