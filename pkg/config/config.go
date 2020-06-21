package config

import (
	"github.com/google/wire"
	"github.com/jkuri/abstruse/pkg/fs"
	"github.com/spf13/viper"
)

// NewConfig inits viper.
func NewConfig(path string) (*viper.Viper, error) {
	v := viper.New()

	if fs.Exists(path) {
		v.SetConfigFile(path)
	}

	return v, nil
}

// ProviderSet export.
var ProviderSet = wire.NewSet(NewConfig)
