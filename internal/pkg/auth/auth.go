package auth

import (
	"fmt"

	"github.com/google/wire"
	"github.com/spf13/viper"
	"go.uber.org/zap"
)

var (
	// JWTSecret from config file.
	JWTSecret []byte
)

type Options struct {
	JWTSecret string
}

func NewOptions(v *viper.Viper, logger *zap.Logger) (*Options, error) {
	opts := &Options{}
	if err := v.UnmarshalKey("auth", opts); err != nil {
		return nil, err
	}
	return opts, nil
}

func InitAuth(opts *Options) error {
	JWTSecret = []byte(opts.JWTSecret)
	if string(JWTSecret) != "" {
		return nil
	}
	return fmt.Errorf("jwt secret should not be empty")
}

var ProviderSet = wire.NewSet(NewOptions, InitAuth)
