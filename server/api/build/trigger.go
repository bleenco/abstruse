package build

import (
	"net/http"

	"github.com/asaskevich/govalidator"
	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/core"
)

// HandleTrigger returns an http.HandlerFunc that writes JSON encoded
// result about triggering build to http response body.
func HandleTrigger(builds core.BuildStore, scheduler core.Scheduler) http.HandlerFunc {
	type form struct {
		ID uint `json:"id" valid:"required"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		// claims := middlewares.ClaimsFromCtx(r.Context())
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

		jobs, err := builds.TriggerBuild(f.ID)
		if err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		for _, job := range jobs {
			if err := scheduler.Next(job); err != nil {
				render.InternalServerError(w, err.Error())
				return
			}
		}

		render.JSON(w, http.StatusOK, render.Empty{})
	}
}
