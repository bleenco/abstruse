package api

import (
	"net/http"

	"github.com/ractol/ractol/internal/version"
	"github.com/ractol/ractol/pkg/render"
)

type system struct{}

func (s *system) version() http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		render.JSON(w, http.StatusOK, version.GetBuildInfo())
	})
}
