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

// Options is configuration for auth.
type Options struct {
	JWTSecret string
}

// NewOptions returns new Options instance.
func NewOptions(v *viper.Viper, logger *zap.Logger) (*Options, error) {
	opts := &Options{}
	if err := v.UnmarshalKey("auth", opts); err != nil {
		return nil, err
	}
	return opts, nil
}

// InitAuth initializes authentication with JWT secret.
func InitAuth(opts *Options) error {
	JWTSecret = []byte(opts.JWTSecret)
	if string(JWTSecret) != "" {
		return nil
	}
	return fmt.Errorf("jwt secret should not be empty")
}

// ProviderSet exports for wire dep injection.
var ProviderSet = wire.NewSet(NewOptions, InitAuth)
