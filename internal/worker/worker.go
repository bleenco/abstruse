package worker

import (
	"github.com/google/wire"
	"github.com/jkuri/abstruse/internal/worker/etcd"
	"github.com/jkuri/abstruse/internal/worker/grpc"
	"go.uber.org/zap"
)

// App worker application.
type App struct {
	opts       *Options
	logger     *zap.SugaredLogger
	grpcServer *grpc.Server
	etcdApp    *etcd.App
	errch      chan error
}

// NewApp returns new intsanceof App.
func NewApp(
	opts *Options,
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
		certid, grpcAddr := app.grpcServer.ID(), app.opts.GRPC.Addr
		if err := app.etcdApp.Start(certid, grpcAddr); err != nil {
			app.errch <- err
		}
	}()

	return <-app.errch
}

// ProviderSet wire export.
var ProviderSet = wire.NewSet(NewApp, NewOptions)
