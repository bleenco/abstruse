package provider

import (
	"net/http"

	"github.com/asaskevich/govalidator"
	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/core"
)

// HandleSync returns an http.HandlerFunc that writes JSON encoded
// result about syncing provider to the http response body.
func HandleSync(providers core.ProviderStore) http.HandlerFunc {
	type form struct {
		ID uint `json:"id" valid:"required"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		// claims := middlewares.ClaimsFromCtx(r.Context())
		// TODO check for valid user permissions.

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

		if err := providers.Sync(f.ID); err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		render.JSON(w, http.StatusOK, render.Empty{})
	}
}
