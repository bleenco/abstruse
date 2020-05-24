package etcd

// import (
// 	"time"

// 	"github.com/jkuri/abstruse/internal/worker/options"
// 	"go.etcd.io/etcd/clientv3"
// 	"go.uber.org/zap"
// )

// // App defines remote worker's etcd service.
// type App struct {
// 	id     string
// 	opts   *options.Options
// 	client *clientv3.Client
// 	logger *zap.SugaredLogger
// 	donech chan struct{}
// }

// // NewApp returns new instance of App.
// func NewApp(opts *options.Options, logger *zap.Logger) *App {
// 	log := logger.With(zap.String("type", "etcd-app")).Sugar()
// 	return &App{
// 		opts:   opts,
// 		logger: log,
// 		donech: make(chan struct{}),
// 	}
// }

// // Start starts etcd service.
// func (app *App) Start(id, grpcAddr string) error {
// 	app.logger.Infof("starting etcd app")
// 	app.id = id
// 	errch := make(chan error)

// connect:
// 	client, err := NewClient(app.opts.Etcd.Addr)
// 	if err != nil {
// 		app.logger.Errorf(
// 			"%s %v, reconnecting...",
// 			app.opts.Etcd.Addr,
// 			err,
// 		)
// 		time.Sleep(time.Second * 5)
// 		goto connect
// 	}
// 	app.client = client
// 	reg := newRegisterService(client, grpcAddr, app.id, 5, app.logger)

// 	go func() {
// 		for {
// 			err := <-errch
// 			app.client = nil
// 			app.logger.Errorf("%v, reconnecting...", err)
// 			reg.stop()
// 		}
// 	}()

// 	if err := reg.register(); err != nil {
// 		errch <- err
// 		app.client = nil
// 		goto connect
// 	}

// 	return nil
// }
