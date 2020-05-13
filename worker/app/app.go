package app

import (
	"github.com/jkuri/abstruse/pkg/logger"
	"github.com/jkuri/abstruse/worker/rpc"
)

// App defines main worker application.
type App struct {
	Server *rpc.Server

	errch chan error
}

// NewApp returns main worker app instance.
func NewApp(config Config) (*App, error) {
	var info, debug bool

	if config.LogLevel == "debug" {
		info = true
		debug = true
	} else if config.LogLevel == "info" {
		info = true
	}

	grpcServer, err := rpc.NewServer(config.GRPC, logger.NewLogger("grpc", info, debug))
	if err != nil {
		return nil, err
	}

	return &App{
		Server: grpcServer,
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

	return <-app.errch
}
