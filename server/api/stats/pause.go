package stats

import (
	"net/http"

	"github.com/bleenco/abstruse/server/api/middlewares"
	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/core"
)

// HandlePause returns an http.HandlerFunc which writes JSON encoded
// result about pausing scheduler to the http response body
func HandlePause(users core.UserStore, scheduler core.Scheduler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims := middlewares.ClaimsFromCtx(r.Context())

		if user, err := users.Find(claims.ID); err != nil || user.Role != "admin" {
			render.UnathorizedError(w, err.Error())
			return
		}

		if err := scheduler.Pause(); err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		render.JSON(w, http.StatusOK, render.Empty{})
	}
}
