package setup

import (
	"net/http"

	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/core"
)

// HandleReady returns an http.HandlerFunc that writes JSON encoded
// status to the http response body.
func HandleReady(users core.UserStore) http.HandlerFunc {
	type resp struct {
		User bool `json:"user"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		res, err := users.List()
		if err != nil {
			render.InternalServerError(w, err.Error())
			return
		}
		user := false
		if len(res) > 0 {
			user = true
		}

		render.JSON(w, http.StatusOK, resp{User: user})
	}
}
