package build

import (
	"net/http"

	"github.com/asaskevich/govalidator"
	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/server/api/middlewares"
	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/core"
)

// HandleStopJob returns an http.HandlerFunc that writes JSON encoded
// result about stopping job to the http response body.
func HandleStopJob(jobs core.JobStore, repos core.RepositoryStore, scheduler core.Scheduler) http.HandlerFunc {
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

		job, err := jobs.Find(uint(f.ID))
		if err != nil {
			render.NotFoundError(w, err.Error())
			return
		}

		if perms := repos.GetPermissions(job.Build.RepositoryID, claims.ID); !perms.Exec {
			render.UnathorizedError(w, err.Error())
			return
		}

		stop, err := scheduler.Stop(job.ID)
		if err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		render.JSON(w, http.StatusOK, stop)
	}
}
