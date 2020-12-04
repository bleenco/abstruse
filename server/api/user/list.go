package user

import (
	"net/http"

	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/core"
)

// HandleList returns an http.HandlerFunc that writes JSON encoded
// list of users to the http response body.
func HandleList(users core.UserStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		data, err := users.List()
		if err != nil {
			render.InternalServerError(w, err.Error())
			return
		}
		render.JSON(w, http.StatusOK, data)
	}
}
