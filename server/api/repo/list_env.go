package repo

import (
	"net/http"
	"strconv"

	"github.com/bleenco/abstruse/server/api/middlewares"
	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/core"
	"github.com/go-chi/chi"
)

// HandleListEnv returns http.HandlerFunc that writes JSON encoded
// list of env variables for repository to the http response body.
func HandleListEnv(envVariables core.EnvVariableStore, repos core.RepositoryStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims := middlewares.ClaimsFromCtx(r.Context())

		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		if perm := repos.GetPermissions(uint(id), claims.ID); !perm.Read {
			render.UnathorizedError(w, "permission denied")
			return
		}

		envs, err := envVariables.List(uint(id))
		if err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		for i, env := range envs {
			if env.Secret {
				envs[i].Value = ""
			}
		}

		render.JSON(w, http.StatusOK, envs)
	}
}
