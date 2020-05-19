package scheduler

import "github.com/spf13/viper"

// Options represent scheduler configuration
type Options struct {
	Max int
}

// NewOptions parses and returns scheduler configuration.
func NewOptions(v *viper.Viper) (*Options, error) {
	opts := &Options{}
	err := v.UnmarshalKey("scheduler", opts)
	return opts, err
}
