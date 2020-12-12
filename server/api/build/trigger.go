package build

import (
	"net/http"

	"github.com/asaskevich/govalidator"
	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/server/api/middlewares"
	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/core"
	"github.com/bleenco/abstruse/server/ws"
)

// HandleTrigger returns an http.HandlerFunc that writes JSON encoded
// result about triggering build to http response body.
func HandleTrigger(builds core.BuildStore, scheduler core.Scheduler, ws *ws.Server) http.HandlerFunc {
	type form struct {
		ID     uint   `json:"id" valid:"required"`
		Config string `json:"config"`
		SHA    string `json:"sha"`
		Branch string `json:"branch"`
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

		opts := core.TriggerBuildOpts{
			ID:     f.ID,
			Config: f.Config,
			SHA:    f.SHA,
			Branch: f.Branch,
			UserID: claims.ID,
		}

		jobs, err := builds.TriggerBuild(opts)
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

		// broadcast new build
		if build, err := builds.Find(f.ID); err == nil {
			ws.App.Broadcast("/subs/builds", map[string]interface{}{"build": build})
		}

		render.JSON(w, http.StatusOK, render.Empty{})
	}
}
