package etcd

import "github.com/spf13/viper"

// Options connfig.
type Options struct {
	ServerAddr string
}

// NewOptions returns configuration.
func NewOptions(v *viper.Viper) (*Options, error) {
	opts := &Options{}
	err := v.UnmarshalKey("etcd", opts)
	return opts, err
}
