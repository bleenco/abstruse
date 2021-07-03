package build

import (
	"io"
	"net/http"
	"regexp"
	"strconv"

	"github.com/bleenco/abstruse/internal/auth"
	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/core"
	"github.com/go-chi/chi"
)

// HandleLog returns http.handlerFunc that writes JSON encoded
// raw log result to the http response body.
func HandleLog(jobs core.JobStore, scheduler core.Scheduler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token := r.URL.Query().Get("token")
		if token == "" {
			render.ForbiddenError(w, "token not provided")
			return
		}

		claims, err := auth.UserClaimsFromJWT(token)
		if err != nil {
			render.ForbiddenError(w, "invalid token")
			return
		}

		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			render.BadRequestError(w, err.Error())
			return
		}

		job, err := jobs.FindUser(uint(id), claims.ID)
		if err != nil {
			render.NotFoundError(w, err.Error())
			return
		}

		if currentLog, err := scheduler.JobLog(uint(id)); err == nil {
			job.Log = currentLog
		}

		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		w.WriteHeader(http.StatusOK)
		re := regexp.MustCompile("[\u001B\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[a-zA-Z\\d]*)*)?\u0007)|(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PRZcf-ntqry=><~]))")
		io.WriteString(w, re.ReplaceAllString(job.Log, ""))
	}
}
