// +build wireinject

package main

import (
	"github.com/google/wire"
	"github.com/jkuri/abstruse/internal/pkg/config"
	"github.com/jkuri/abstruse/internal/pkg/log"
	"github.com/jkuri/abstruse/internal/worker"
	"github.com/jkuri/abstruse/internal/worker/grpc"
)

var providerSet = wire.NewSet(
	log.ProviderSet,
	config.ProviderSet,
	grpc.ProviderSet,
	worker.ProviderSet,
)

func CreateApp(cfg string) (*worker.App, error) {
	panic(wire.Build(providerSet))
}
