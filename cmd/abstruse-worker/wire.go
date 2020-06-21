// +build wireinject

package main

import (
	"github.com/google/wire"
	"github.com/jkuri/abstruse/pkg/log"
	"github.com/jkuri/abstruse/pkg/worker/app"
	"github.com/jkuri/abstruse/pkg/worker/options"
)

var providerSet = wire.NewSet(
	options.ProviderSet,
	log.ProviderSet,
	app.ProviderSet,
)

func CreateApp(cfg string) (*app.App, error) {
	panic(wire.Build(providerSet))
}
