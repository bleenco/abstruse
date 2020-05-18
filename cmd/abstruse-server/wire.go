// +build wireinject

package main

import (
	"github.com/google/wire"
	"github.com/jkuri/abstruse/internal/pkg/auth"
	"github.com/jkuri/abstruse/internal/pkg/config"
	"github.com/jkuri/abstruse/internal/pkg/etcd"
	"github.com/jkuri/abstruse/internal/pkg/http"
	"github.com/jkuri/abstruse/internal/pkg/log"
	"github.com/jkuri/abstruse/internal/server"
	"github.com/jkuri/abstruse/internal/server/controller"
	"github.com/jkuri/abstruse/internal/server/db"
	"github.com/jkuri/abstruse/internal/server/db/repository"
	"github.com/jkuri/abstruse/internal/server/grpc"
	"github.com/jkuri/abstruse/internal/server/service"
	"github.com/jkuri/abstruse/internal/server/websocket"
)

var providerSet = wire.NewSet(
	log.ProviderSet,
	config.ProviderSet,
	http.ProviderSet,
	etcd.ProviderSet,
	server.ProviderSet,
	db.ProviderSet,
	repository.ProviderSet,
	auth.ProviderSet,
	controller.ProviderSet,
	service.ProviderSet,
	websocket.ProviderSet,
	grpc.ProviderSet,
)

func CreateApp(cfg string) (*server.App, error) {
	panic(wire.Build(providerSet))
}
