package app

import (
	"github.com/jkuri/abstruse/pkg/etcdutil"
	"github.com/jkuri/abstruse/pkg/logger"
	"github.com/jkuri/abstruse/worker/rpc"
)

// App defines main worker application.
type App struct {
	Server *rpc.Server

	config Config
	errch  chan error
}

// NewApp returns main worker app instance.
func NewApp(config Config) (*App, error) {
	grpcServer, err := rpc.NewServer(config.GRPC, logger.NewLogger("grpc", config.LogLevel))
	if err != nil {
		return nil, err
	}

	return &App{
		Server: grpcServer,
		config: config,
		errch:  make(chan error),
	}, nil
}

// Run starts main worker app.
func (app *App) Run() error {
	go func() {
		if err := app.Server.Listen(); err != nil {
			app.errch <- err
		}
	}()

	go func() {
		log := logger.NewLogger("etcd", app.config.LogLevel)
		if err := etcdutil.Register(app.config.ServerAddr, app.config.GRPC.ListenAddr, 5, log); err != nil {
			log.Errorf("%v", err)
		}
	}()

	return <-app.errch
}
