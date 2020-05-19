package etcd

import (
	"fmt"
	"strings"
	"time"

	"github.com/jkuri/abstruse/internal/pkg/id"
	"github.com/jkuri/abstruse/internal/worker/grpc"
	"go.etcd.io/etcd/clientv3"
	"go.uber.org/zap"
)

// App defines remote worker's etcd service.
type App struct {
	id         string
	opts       *Options
	client     *clientv3.Client
	grpcServer *grpc.Server
	logger     *zap.SugaredLogger
	donech     chan struct{}
	connected  bool
}

// NewApp returns new instance of App.
func NewApp(opts *Options, logger *zap.Logger, grpcServer *grpc.Server) *App {
	log := logger.With(zap.String("type", "etcd-app")).Sugar()
	grpcOpts := grpcServer.GetOptions()
	id := strings.ToUpper(id.New([]byte(fmt.Sprintf("%s-%s", grpcOpts.Cert, grpcOpts.Addr)))[0:6])
	return &App{
		id:         id,
		opts:       opts,
		grpcServer: grpcServer,
		logger:     log,
		donech:     make(chan struct{}),
		connected:  false,
	}
}

// Start starts etcd service.
func (app *App) Start() error {
	app.logger.Infof("starting etcd app")
	errch := make(chan error)

connect:
	client, err := NewClient(app.opts.ServerAddr)
	if err != nil {
		app.logger.Errorf(
			"%s %v, reconnecting...",
			app.opts.ServerAddr,
			err,
		)
		time.Sleep(time.Second * 5)
		goto connect
	}
	app.client = client
	app.connected = true
	reg := newRegisterService(client, app.grpcServer.Addr(), 5, app.logger)

	go func() {
		for {
			err := <-errch
			app.connected = false
			app.client = nil
			app.logger.Errorf("%v, reconnecting...", err)
			reg.stop()
		}
	}()

	if err := reg.register(); err != nil {
		errch <- err
		app.connected = false
		app.client = nil
		goto connect
	}

	return nil
}

// ConnectionStatus returns if etcd client is available.
func (app *App) ConnectionStatus() bool {
	return app.connected
}

// Client returns etcd client.
func (app *App) Client() *clientv3.Client {
check:
	if !app.connected {
		time.Sleep(time.Second)
		goto check
	}
	return app.client
}

// ID returns identification.
func (app *App) ID() string {
	return app.id
}
