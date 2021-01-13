package repo

import (
	"net/http"

	"github.com/asaskevich/govalidator"
	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/core"
)

// HandleCreateEnv returns an http.HandlerFunc that writes json encoded
// result about creating env variable to the http response body.
func HandleCreateEnv(envVariables core.EnvVariableStore) http.HandlerFunc {
	type form struct {
		Key          string `json:"key" valid:"required"`
		Value        string `json:"value" valid:"required"`
		Secret       bool   `json:"secret" valid:"required"`
		RepositoryID uint   `json:"repositoryID" valid:"required"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		// claims := middlewares.ClaimsFromCtx(r.Context())
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

		env := &core.EnvVariable{
			Key:          f.Key,
			Value:        f.Value,
			Secret:       f.Secret,
			RepositoryID: f.RepositoryID,
		}

		if err := envVariables.Create(env); err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		render.JSON(w, http.StatusOK, env)
	}
}
