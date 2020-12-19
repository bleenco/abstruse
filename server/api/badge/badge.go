package badge

import (
	"net/http"

	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/core"
	"github.com/go-chi/chi"
	"github.com/narqo/go-badge"
)

// HandleBadge returns an http.HandlerFunc that writes SVG status build
// icon to the http response body.
func HandleBadge(builds core.BuildStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token := chi.URLParam(r, "token")
		branch := r.URL.Query().Get("branch")

		status, err := builds.FindStatus(token, branch)
		if err != nil {
			status = core.BuildStatusUnknown
		}
		color := "#555555"
		if status == core.BuildStatusPassing {
			color = "#48bb78"
		} else if status == core.BuildStatusFailing {
			color = "#e74c3c"
		} else if status == core.BuildStatusRunning {
			color = "#ecc94b"
		}

		svg, err := badge.RenderBytes("build", status, badge.Color(color))
		if err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		w.Header().Set("Content-Type", "image/svg+xml")
		w.Write(svg)
	}
}
