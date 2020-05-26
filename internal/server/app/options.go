package app

import (
	"github.com/spf13/viper"
)

// Options holds config for gRPC client.
type Options struct {
	Cert string
	Key  string
}

// NewOptions returns new intsance of Options config.
func NewOptions(v *viper.Viper) (*Options, error) {
	opts := &Options{}
	err := v.UnmarshalKey("grpcclient", opts)
	return opts, err
}
