// +build wireinject

package cmd

import (
	"github.com/bleenco/abstruse/worker/app"
	"github.com/bleenco/abstruse/worker/logger"
	"github.com/google/wire"
)

func CreateApp() (*application, error) {
	panic(wire.Build(wire.NewSet(
		wire.NewSet(logger.New),
		wire.NewSet(app.NewApp),
		wire.NewSet(newApplication, newConfig),
	)))
}
