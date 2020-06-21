// +build wireinject

package main

import (
	"github.com/google/wire"
	"github.com/jkuri/abstruse/pkg/auth"
	"github.com/jkuri/abstruse/pkg/log"
	"github.com/jkuri/abstruse/pkg/server"
	"github.com/jkuri/abstruse/pkg/server/app"
	"github.com/jkuri/abstruse/pkg/server/controller"
	"github.com/jkuri/abstruse/pkg/server/db"
	"github.com/jkuri/abstruse/pkg/server/db/repository"
	"github.com/jkuri/abstruse/pkg/server/etcd"
	"github.com/jkuri/abstruse/pkg/server/http"
	"github.com/jkuri/abstruse/pkg/server/options"
	"github.com/jkuri/abstruse/pkg/server/service"
	"github.com/jkuri/abstruse/pkg/server/websocket"
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
