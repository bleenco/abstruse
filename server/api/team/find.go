package team

import (
	"net/http"
	"strconv"

	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/core"
	"github.com/go-chi/chi"
)

// HandleFind returns an http.HandlerFunc that writes JSON encoded
// team result to the http response body.
func HandleFind(teams core.TeamStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		team, err := teams.Find(uint(id))
		if err != nil {
			render.NotFoundError(w, err.Error())
			return
		}

		render.JSON(w, http.StatusOK, team)
	}
}
