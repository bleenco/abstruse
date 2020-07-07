package api

import (
	"net/http"

	"github.com/ractol/ractol/pkg/render"
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
