package api

import (
	"net/http"

	"github.com/bleenco/abstruse/internal/version"
	"github.com/bleenco/abstruse/pkg/render"
	"go.uber.org/zap"
)

type system struct {
	logger *zap.SugaredLogger
}

func newSystem(logger *zap.Logger) system {
	return system{
		logger: logger.With(zap.String("api", "system")).Sugar(),
	}
}

func (s *system) version() http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		render.JSON(w, http.StatusOK, version.GetBuildInfo())
	})
}
