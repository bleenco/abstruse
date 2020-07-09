package api

import (
	"net/http"

	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/pkg/render"
	"github.com/bleenco/abstruse/server/config"
	"github.com/bleenco/abstruse/server/core"
	"github.com/bleenco/abstruse/server/db"
	"github.com/bleenco/abstruse/server/db/repository"
	"go.uber.org/zap"
)

type setup struct {
	logger   *zap.SugaredLogger
	userRepo repository.UserRepo
	app      *core.App
}

func newSetup(logger *zap.Logger, app *core.App) setup {
	return setup{
		logger:   logger.With(zap.String("type", "setup")).Sugar(),
		userRepo: repository.NewUserRepo(),
		app:      app,
	}
}

func (s *setup) ready() http.HandlerFunc {
	type resp struct {
		Database bool `json:"database"`
		User     bool `json:"user"`
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, err := db.Instance()
		if err != nil {
			render.JSON(w, http.StatusOK, resp{Database: false, User: false})
			return
		}

		exists, err := s.userRepo.AdminExists()
		if err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		render.JSON(w, http.StatusOK, resp{Database: true, User: exists})
	})
}

func (s *setup) config() http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		render.JSON(w, http.StatusOK, core.Config)
	})
}

func (s *setup) saveConfig() http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var f config.Config
		defer r.Body.Close()

		if err := lib.DecodeJSON(r.Body, &f); err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		if err := s.app.SaveConfig(&f); err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		render.JSON(w, http.StatusOK, render.Empty{})
	})
}

func (s *setup) testDatabaseConnection() http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var f config.Db
		defer r.Body.Close()

		if err := lib.DecodeJSON(r.Body, &f); err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		render.JSON(w, http.StatusOK, db.CheckConnection(f))
	})
}

func (s *setup) etcd() http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var f config.Config
		defer r.Body.Close()

		if err := lib.DecodeJSON(r.Body, &f); err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		if err := s.app.SaveConfig(&f); err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		if err := s.app.RestartEtcd(); err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		render.JSON(w, http.StatusOK, render.Empty{})
	})
}
