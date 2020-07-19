package core

import (
	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/worker/config"
	"go.etcd.io/etcd/clientv3"
	"go.uber.org/zap"
)

// App represents main worker application.
type App struct {
	cfg       *config.Config
	id        string
	addr      string
	api       *APIServer
	scheduler *scheduler
	client    *clientv3.Client
	log       *zap.Logger
	logger    *zap.SugaredLogger
	errch     chan error
}

// NewApp returns new instance of an App.
func NewApp(cfg *config.Config, logger *zap.Logger) (*App, error) {
	app := &App{
		cfg:    cfg,
		addr:   lib.GetListenAddress(cfg.GRPC.ListenAddr),
		id:     cfg.ID,
		log:    logger,
		logger: logger.Sugar(),
		errch:  make(chan error),
	}
	app.api = NewAPIServer(app)
	scheduler, err := newScheduler(cfg.ID, cfg.Scheduler.MaxParallel, logger, app)
	if err != nil {
		return nil, err
	}
	app.scheduler = scheduler
	return app, nil
}

// Run starts worker application.
func (app *App) Run() error {
	app.logger.Infof("starting abstruse worker node %s at %s", app.cfg.ID, app.cfg.GRPC.ListenAddr)
	errch := make(chan error)

	go func() {
		if err := app.api.Start(); err != nil {
			errch <- err
		}
	}()

	go func() {
		for {
			app.connectLoop()
			go app.scheduler.run()
			<-app.errch
			app.scheduler.stop()
		}
	}()

	// go func() {
	// 	tags := []string{
	// 		"abstruse.jan.local/build-essential:v0.0.1",
	// 		"abstruse.jan.local/build-essential:canary",
	// 		"abstruse.jan.local/build-essential:legacy",
	// 	}
	// 	dockerFile := `
	//   FROM ubuntu:focal
	//   RUN apt update && apt install -y build-essential
	//   `

	// 	resp, err := docker.BuildImage(tags, dockerFile)
	// 	if err != nil {
	// 		panic(err)
	// 	}
	// 	defer resp.Body.Close()

	// 	_, err = io.Copy(os.Stdout, resp.Body)
	// 	if err != nil {
	// 		panic(err)
	// 	}

	// 	for _, tag := range tags {
	// 		out, err := docker.PushImage(tag, "abstruse", "xx2n5")
	// 		if err != nil {
	// 			panic(err)
	// 		}
	// 		defer out.Close()
	// 		_, err = io.Copy(os.Stdout, out)
	// 		if err != nil {
	// 			panic(err)
	// 		}
	// 	}

	// }()

	return <-errch
}
