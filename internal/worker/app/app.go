package app

import (
	"github.com/google/wire"
	"github.com/jkuri/abstruse/internal/pkg/util"
	"github.com/jkuri/abstruse/internal/worker/grpc"
	"github.com/jkuri/abstruse/internal/worker/id"
	"github.com/jkuri/abstruse/internal/worker/options"
	"go.etcd.io/etcd/clientv3"
	"go.uber.org/zap"
)

// App worker application.
type App struct {
	id      string // worker id generated based on certificate and listen addrress
	addr    string // grpc listen address
	opts    *options.Options
	logger  *zap.SugaredLogger
	grpcsrv *grpc.Server
	client  *clientv3.Client
	errch   chan error
}

// NewApp returns new intsanceof App.
func NewApp(opts *options.Options, logger *zap.Logger) (*App, error) {
	addr := util.GetListenAddress(opts.GRPC.ListenAddr)
	id, err := id.GenerateID(opts)
	if err != nil {
		return nil, err
	}

	return &App{
		id:      id,
		addr:    addr,
		opts:    opts,
		logger:  logger.Sugar(),
		grpcsrv: grpc.NewServer(id, addr, opts, logger),
		errch:   make(chan error),
	}, nil
}

// Start starts worker application.
func (app *App) Start() error {
	app.logger.Info("starting worker...")

	go func() {
		if err := app.grpcsrv.Start(); err != nil {
			app.errch <- err
		}
	}()

	go func() {
		if err := app.connect(); err != nil {
			app.errch <- err
		}
	}()

	// go func() {
	// 	id, grpcAddr := app.grpcServer.ID(), app.opts.GRPC.ListenAddr
	// 	if err := app.etcdApp.Start(id, grpcAddr); err != nil {
	// 		app.errch <- err
	// 	}
	// }()

	return <-app.errch
}

// ProviderSet exports for wire dependency injection.
var ProviderSet = wire.NewSet(NewApp)
