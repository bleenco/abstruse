package provider

import (
	"net/http"

	"github.com/bleenco/abstruse/server/api/middlewares"
	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/core"
)

// HandleListUser returns http.HandlerFunc that writes JSON encoded
// list of providers based on user id to http response body.
func HandleListUser(providers core.ProviderStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims := middlewares.ClaimsFromCtx(r.Context())

		providers, err := providers.ListUser(claims.ID)
		if err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		render.JSON(w, http.StatusOK, providers)
	}
}
