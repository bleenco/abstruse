package repo

import (
	"net/http"
	"strconv"

	"github.com/bleenco/abstruse/server/api/middlewares"
	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/core"
	"github.com/go-chi/chi"
)

// HandleDeleteEnv returns http.HandlerFunc that writes JSON encoded
// result about deleting env variable to the http response body.
func HandleDeleteEnv(envVariables core.EnvVariableStore, repos core.RepositoryStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims := middlewares.ClaimsFromCtx(r.Context())

		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		if perm := repos.GetPermissions(uint(id), claims.ID); !perm.Write {
			render.UnathorizedError(w, "permission denied")
			return
		}

		envid, err := strconv.Atoi(chi.URLParam(r, "envid"))
		if err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		env, err := envVariables.Find(uint(envid))
		if err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		if err := envVariables.Delete(env); err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		render.JSON(w, http.StatusOK, render.Empty{})
	}
}
