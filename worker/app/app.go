package app

import (
	"context"
	"fmt"
	"time"

	"github.com/bleenco/abstruse/internal/auth"
	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/worker/config"
	"github.com/bleenco/abstruse/worker/http"
	"go.uber.org/zap"
)

// App represents main worker node application entrypoint.
type App struct {
	Config    *config.Config
	Client    *http.Client
	Logger    *zap.SugaredLogger
	API       *Server
	Scheduler *scheduler
}

// NewApp returns new App instance.
func NewApp(config *config.Config, logger *zap.Logger) (*App, error) {
	app := &App{
		Config: config,
		Logger: logger.With(zap.String("type", "app")).Sugar(),
	}
	token, err := auth.JWT.CreateWorkerJWT(auth.WorkerClaims{ID: config.ID, Addr: config.GRPC.Addr})
	if err != nil {
		return nil, err
	}
	client, err := http.NewClient(config.Server.Addr, token)
	if err != nil {
		return nil, err
	}
	app.Client = client
	app.API = NewServer(config, logger, app)
	app.Scheduler = newScheduler(config.Scheduler.MaxParallel, logger, app)

	return app, nil
}

// Run start main application loop.
func (a *App) Run() error {
	errch := make(chan error, 1)
	quitch := make(chan error, 1)

	go func() {
		if err := a.API.Run(); err != nil {
			quitch <- err
		}
	}()

	go func() {
		if err := a.Scheduler.run(); err != nil {
			quitch <- err
		}
	}()

	go func() {
		for {
			select {
			case err := <-errch:
				a.Logger.Error(err.Error())
				time.Sleep(5 * time.Second)
				if err := a.sendAuthRequest(); err != nil {
					errch <- err
				}
			case err := <-a.API.Error():
				errch <- err
			}
		}
	}()

	go func() {
		if err := a.sendAuthRequest(); err != nil {
			errch <- err
		}
	}()

	return <-quitch
}

func (a *App) sendAuthRequest() error {
	type response struct {
		Auth string `json:"auth"`
		Init bool   `json:"init"`
	}

	req := &http.Request{
		Method: "POST",
		Path:   "/api/v1/workers/auth",
	}

	resp, err := a.Client.Req(context.Background(), req, nil)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.Status == 200 {
		var r response
		if err := lib.DecodeJSON(resp.Body, &r); err != nil {
			return err
		}
		return nil
	}

	var r render.Error
	if err := lib.DecodeJSON(resp.Body, &r); err != nil {
		return err
	}

	return fmt.Errorf("error connecting to abstruse server: %s", r.Message)
}
