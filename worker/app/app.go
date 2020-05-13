package app

import (
	"github.com/jkuri/abstruse/pkg/etcdutil"
	"github.com/jkuri/abstruse/pkg/logger"
	"github.com/jkuri/abstruse/worker/rpc"
)

// App defines main worker application.
type App struct {
	Server *rpc.Server
	Config Config

	loginfo  bool
	logdebug bool
	errch    chan error
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
		Server:   grpcServer,
		Config:   config,
		loginfo:  info,
		logdebug: debug,
		errch:    make(chan error),
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
		log := logger.NewLogger("etcd", app.loginfo, app.logdebug)
		if err := etcdutil.Register(app.Config.ServerAddr, app.Config.GRPC.ListenAddr, 5, log); err != nil {
			log.Errorf("%v", err)
		}
	}()

	return <-app.errch
}
