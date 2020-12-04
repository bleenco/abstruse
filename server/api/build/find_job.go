package build

import (
	"net/http"
	"strconv"

	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/core"
	"github.com/go-chi/chi"
)

// HandleFindJob returns http.handlerFunc that writes JSON encoded
// job result to the http response body.
func HandleFindJob(jobs core.JobStore, scheduler core.Scheduler) http.HandlerFunc {
	type resp struct {
		*core.Job
		Log string `json:"log"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			render.BadRequestError(w, err.Error())
			return
		}

		job, err := jobs.Find(uint(id))
		if err != nil {
			render.NotFoundError(w, err.Error())
			return
		}

		if currentLog, err := scheduler.JobLog(uint(id)); err == nil {
			job.Log = currentLog
		}

		render.JSON(w, http.StatusOK, resp{job, job.Log})
	}
}
