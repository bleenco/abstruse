package build

import (
	"net/http"

	"github.com/asaskevich/govalidator"
	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/server/api/middlewares"
	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/core"
)

// HandleRestartJob returns an http.HandlerFunc that writes JSON encoded
// result about restarting job to http response body.
func HandleRestartJob(jobs core.JobStore, repos core.RepositoryStore, scheduler core.Scheduler) http.HandlerFunc {
	type form struct {
		ID uint `json:"id" valid:"required"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		claims := middlewares.ClaimsFromCtx(r.Context())
		var f form
		var err error
		defer r.Body.Close()

		if err = lib.DecodeJSON(r.Body, &f); err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		if valid, err := govalidator.ValidateStruct(f); err != nil || !valid {
			render.BadRequestError(w, err.Error())
			return
		}

		if perms := repos.GetPermissions(f.ID, claims.ID); !perms.Exec {
			render.UnathorizedError(w, "permission denied")
			return
		}

		job, err := jobs.Find(uint(f.ID))
		if err != nil {
			render.NotFoundError(w, err.Error())
			return
		}

		if err := scheduler.Next(job); err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		render.JSON(w, http.StatusOK, render.Empty{})
	}
}
