package server

import (
	"github.com/google/wire"
	"github.com/jkuri/abstruse/pkg/auth"
	"github.com/jkuri/abstruse/pkg/server/app"
	"github.com/jkuri/abstruse/pkg/server/etcd"
	"github.com/jkuri/abstruse/pkg/server/http"
	"github.com/jkuri/abstruse/pkg/server/options"
	"github.com/jkuri/abstruse/pkg/server/websocket"
	"go.uber.org/zap"
)

// App master application.
type App struct {
	opts       *options.Options
	logger     *zap.SugaredLogger
	httpServer *http.Server
	wsServer   *websocket.Server
	etcdServer *etcd.Server
	app        *app.App
}

// NewApp returns new instance of App
func NewApp(opts *options.Options, logger *zap.Logger, httpServer *http.Server, etcdServer *etcd.Server, wsServer *websocket.Server, app *app.App) *App {
	log := logger.With(zap.String("type", "app")).Sugar()
	return &App{opts, log, httpServer, wsServer, etcdServer, app}
}

// Start starts master application.
func (app *App) Start() error {
	errch := make(chan error)

	if err := app.init(); err != nil {
		errch <- err
	}

	go func() {
		if err := app.httpServer.Start(); err != nil {
			errch <- err
		}
	}()

	go func() {
		if err := app.wsServer.Start(); err != nil {
			errch <- err
		}
	}()

	go func() {
		if err := app.etcdServer.Start(); err != nil {
			errch <- err
		}
	}()

	go func() {
		if err := app.app.Start(app.etcdServer.Client()); err != nil {
			errch <- err
		}
	}()

	return <-errch
}

func (app *App) init() error {
	err := auth.InitAuth(app.opts.Auth)
	return err
}

// ProviderSet export.
var ProviderSet = wire.NewSet(NewApp)
