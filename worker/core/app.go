package core

import (
	"github.com/jkuri/abstruse/pkg/logger"
	"github.com/jkuri/abstruse/worker/rpc"
)

// App defines main worker application.
type App struct {
	Server *rpc.Server
	log    *logger.Logger
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
		log:    logger.NewLogger("app", config.LogLevel),
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

	go app.connLoop()

	return <-app.errch
}
