package etcd

import "github.com/spf13/viper"

type Options struct {
	ServerAddr string
}

func NewOptions(v *viper.Viper) (*Options, error) {
	opts := &Options{}
	err := v.UnmarshalKey("etcd", opts)
	return opts, err
}
