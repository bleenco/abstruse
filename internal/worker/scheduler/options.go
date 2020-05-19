package scheduler

import "github.com/spf13/viper"

type Options struct {
	Max int
}

func NewOptions(v *viper.Viper) (*Options, error) {
	opts := &Options{}
	err := v.UnmarshalKey("scheduler", opts)
	return opts, err
}
