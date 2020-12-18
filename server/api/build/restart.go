package build

import (
	"net/http"

	"github.com/asaskevich/govalidator"
	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/server/api/middlewares"
	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/core"
)

// HandleRestart returns an http.HandlerFunc that writes JSON encoded
// result about restarting build to http response body.
func HandleRestart(builds core.BuildStore, repos core.RepositoryStore, scheduler core.Scheduler) http.HandlerFunc {
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

		build, err := builds.Find(uint(f.ID))
		if err != nil {
			render.NotFoundError(w, err.Error())
			return
		}

		if perms := repos.GetPermissions(build.RepositoryID, claims.ID); !perms.Exec {
			render.UnathorizedError(w, "permission denied")
			return
		}

		if err := scheduler.RestartBuild(build.ID); err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		render.JSON(w, http.StatusOK, render.Empty{})
	}
}
