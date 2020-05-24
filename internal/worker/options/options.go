package options

import (
	"github.com/google/wire"
	"github.com/spf13/viper"
)

// Options etcd config.
type Options struct {
	Cert string
	Key  string
	Etcd struct {
		Addr     string
		Username string
		Password string
	}
	GRPC struct {
		ListenAddr string
	}
	Scheduler struct {
		MaxConcurrency int
	}
	Log struct {
		Level      string
		Stdout     bool
		Filename   string
		MaxSize    int
		MaxBackups int
		MaxAge     int
	}
}

// NewOptions returns configuration.
func NewOptions(v *viper.Viper) (*Options, error) {
	opts := &Options{}
	err := v.Unmarshal(opts)
	return opts, err
}

// ProviderSet exports for wire dependency injection.
var ProviderSet = wire.NewSet(NewOptions)
