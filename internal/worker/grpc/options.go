package grpc

import "github.com/spf13/viper"

// Options includes gRPC server configuration properties.
type Options struct {
	Addr string
	Cert string
	Key  string
}

// NewOptions returns Options instance.
func NewOptions(v *viper.Viper) (*Options, error) {
	opts := &Options{}
	err := v.UnmarshalKey("grpc", opts)
	return opts, err
}
