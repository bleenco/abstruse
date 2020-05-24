// +build wireinject

package main

import (
	"github.com/google/wire"
	"github.com/jkuri/abstruse/internal/pkg/config"
	"github.com/jkuri/abstruse/internal/pkg/log"
	"github.com/jkuri/abstruse/internal/worker"
	"github.com/jkuri/abstruse/internal/worker/etcd"
	"github.com/jkuri/abstruse/internal/worker/grpc"
	"github.com/jkuri/abstruse/internal/worker/options"
)

var providerSet = wire.NewSet(
	options.ProviderSet,
	log.ProviderSet,
	config.ProviderSet,
	grpc.ProviderSet,
	worker.ProviderSet,
	etcd.ProviderSet,
)

func CreateApp(cfg string) (*worker.App, error) {
	panic(wire.Build(providerSet))
}
