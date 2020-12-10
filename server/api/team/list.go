package team

import (
	"net/http"

	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/core"
)

// HandleList returns an http.HandlerFunc that writes JSON encoded
// teams result to the http response body.
func HandleList(teams core.TeamStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		teams, err := teams.List()
		if err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		render.JSON(w, http.StatusOK, teams)
	}
}
