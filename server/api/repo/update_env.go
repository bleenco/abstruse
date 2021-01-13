package repo

import (
	"net/http"

	"github.com/asaskevich/govalidator"
	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/server/api/middlewares"
	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/core"
)

// HandleUpdateEnv returns an http.HandlerFunc that writes json encoded
// result about updating env variable to the http response body.
func HandleUpdateEnv(envVariables core.EnvVariableStore, repos core.RepositoryStore) http.HandlerFunc {
	type form struct {
		ID           uint   `json:"id" valid:"required"`
		Key          string `json:"key" valid:"required"`
		Value        string `json:"value" valid:"required"`
		Secret       bool   `json:"secret" valid:"required"`
		RepositoryID uint   `json:"repositoryID" valid:"required"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		claims := middlewares.ClaimsFromCtx(r.Context())
		var f form
		var err error
		defer r.Body.Close()

		if err = lib.DecodeJSON(r.Body, &f); err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		if valid, err := govalidator.ValidateStruct(f); err != nil || !valid {
			render.BadRequestError(w, err.Error())
			return
		}

		if perm := repos.GetPermissions(f.RepositoryID, claims.ID); !perm.Write {
			render.UnathorizedError(w, "permission denied")
			return
		}

		env, err := envVariables.Find(f.ID)
		if err != nil {
			render.NotFoundError(w, err.Error())
			return
		}

		env.Key = f.Key
		env.Value = f.Value
		env.Secret = f.Secret

		if err := envVariables.Update(env); err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		render.JSON(w, http.StatusOK, env)
	}
}
