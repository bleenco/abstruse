package config

import (
	"github.com/google/wire"
	"github.com/spf13/viper"
)

// NewConfig inits viper.
func NewConfig(path string) (*viper.Viper, error) {
	v := viper.New()
	v.AddConfigPath(".")
	v.SetConfigFile(path)

	if err := v.ReadInConfig(); err != nil {
		return nil, err
	}

	return v, nil
}

// ProviderSet export.
var ProviderSet = wire.NewSet(NewConfig)
