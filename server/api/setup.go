package api

import (
	"net/http"

	"github.com/ractol/ractol/pkg/lib"
	"github.com/ractol/ractol/pkg/render"
	"github.com/ractol/ractol/server/config"
	"github.com/ractol/ractol/server/core"
	"github.com/ractol/ractol/server/db"
	"github.com/ractol/ractol/server/db/repository"
	"go.uber.org/zap"
)

type setup struct {
	logger   *zap.SugaredLogger
	userRepo repository.UserRepo
}

func newSetup(logger *zap.Logger) setup {
	return setup{
		logger:   logger.With(zap.String("type", "setup")).Sugar(),
		userRepo: repository.NewUserRepo(),
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

		if err := core.SaveConfig(f); err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		render.JSON(w, http.StatusOK, render.Empty{})
	})
}
