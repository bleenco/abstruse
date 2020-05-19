package server

import (
	"github.com/google/wire"
	"github.com/jkuri/abstruse/internal/pkg/auth"
	"github.com/jkuri/abstruse/internal/pkg/http"
	"github.com/jkuri/abstruse/internal/server/etcd"
	"github.com/jkuri/abstruse/internal/server/grpc"
	"github.com/jkuri/abstruse/internal/server/websocket"
	"go.uber.org/zap"
)

// App master application.
type App struct {
	opts       *Options
	logger     *zap.SugaredLogger
	httpServer *http.Server
	wsServer   *websocket.Server
	etcdServer *etcd.Server
	grpcApp    *grpc.App
}

// NewApp returns new instance of App
func NewApp(
	opts *Options,
	logger *zap.Logger,
	httpServer *http.Server,
	etcdServer *etcd.Server,
	wsServer *websocket.Server,
	grpcApp *grpc.App,
) *App {
	log := logger.With(zap.String("type", "app")).Sugar()
	return &App{opts, log, httpServer, wsServer, etcdServer, grpcApp}
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
		if err := app.grpcApp.Start(app.etcdServer.Client()); err != nil {
			errch <- err
		}
	}()

	go app.scheduleJobs()

	return <-errch
}

func (app *App) init() error {
	err := auth.InitAuth(app.opts.Auth)
	return err
}

// ProviderSet export.
var ProviderSet = wire.NewSet(NewApp, NewOptions)
