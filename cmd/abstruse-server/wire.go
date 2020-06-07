// +build wireinject

package main

import (
	"github.com/google/wire"
	"github.com/jkuri/abstruse/internal/pkg/auth"
	"github.com/jkuri/abstruse/internal/pkg/log"
	"github.com/jkuri/abstruse/internal/server"
	"github.com/jkuri/abstruse/internal/server/app"
	"github.com/jkuri/abstruse/internal/server/controller"
	"github.com/jkuri/abstruse/internal/server/db"
	"github.com/jkuri/abstruse/internal/server/db/repository"
	"github.com/jkuri/abstruse/internal/server/etcd"
	"github.com/jkuri/abstruse/internal/server/http"
	"github.com/jkuri/abstruse/internal/server/options"
	"github.com/jkuri/abstruse/internal/server/service"
	"github.com/jkuri/abstruse/internal/server/websocket"
)

var providerSet = wire.NewSet(
	log.ProviderSet,
	options.ProviderSet,
	http.ProviderSet,
	etcd.ProviderSet,
	app.ProviderSet,
	db.ProviderSet,
	repository.ProviderSet,
	auth.ProviderSet,
	controller.ProviderSet,
	service.ProviderSet,
	websocket.ProviderSet,
	server.ProviderSet,
)

func CreateApp(cfg string) (*server.App, error) {
	panic(wire.Build(providerSet))
}
