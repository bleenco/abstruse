package provider

import (
	"net/http"
	"strconv"

	"github.com/bleenco/abstruse/server/api/middlewares"
	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/core"
	"github.com/go-chi/chi"
)

// HandleDelete returns an http.HandlerFunc that writes JSON encoded
// result about deleting provider to the http response body.
func HandleDelete(providers core.ProviderStore, users core.UserStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims := middlewares.ClaimsFromCtx(r.Context())
		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		user, err := users.Find(claims.ID)
		if err != nil {
			render.UnathorizedError(w, err.Error())
			return
		}

		provider, err := providers.Find(uint(id))
		if err != nil {
			render.NotFoundError(w, err.Error())
			return
		}

		if provider.UserID == claims.ID || user.Role == "admin" {
			if err := providers.Delete(provider); err != nil {
				render.InternalServerError(w, err.Error())
				return
			}
			render.JSON(w, http.StatusOK, render.Empty{})
			return
		}

		render.UnathorizedError(w, err.Error())
	}
}
