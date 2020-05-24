package worker

import (
	"github.com/google/wire"
	"github.com/jkuri/abstruse/internal/worker/etcd"
	"github.com/jkuri/abstruse/internal/worker/grpc"
	"github.com/jkuri/abstruse/internal/worker/options"
	"go.uber.org/zap"
)

// App worker application.
type App struct {
	opts       *options.Options
	logger     *zap.SugaredLogger
	grpcServer *grpc.Server
	etcdApp    *etcd.App
	errch      chan error
}

// NewApp returns new intsanceof App.
func NewApp(
	opts *options.Options,
	logger *zap.Logger,
	grpcServer *grpc.Server,
	etcdApp *etcd.App,
) *App {
	log := logger.With(zap.String("type", "app")).Sugar()
	return &App{opts, log, grpcServer, etcdApp, make(chan error)}
}

// Start starts worker application.
func (app *App) Start() error {
	app.logger.Info("starting worker app")
	go func() {
		if err := app.grpcServer.Start(); err != nil {
			app.errch <- err
		}
	}()

	go func() {
		id, grpcAddr := app.grpcServer.ID(), app.opts.GRPC.ListenAddr
		if err := app.etcdApp.Start(id, grpcAddr); err != nil {
			app.errch <- err
		}
	}()

	return <-app.errch
}

// ProviderSet exports for wire dependency injection.
var ProviderSet = wire.NewSet(NewApp)
