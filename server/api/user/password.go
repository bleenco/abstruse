package user

import (
	"net/http"

	"github.com/asaskevich/govalidator"
	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/server/api/middlewares"
	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/core"
)

// HandlePassword returns http.HandlerFunc that writes JSON encoded
// result about updated user password to the http response body.
func HandlePassword(users core.UserStore) http.HandlerFunc {
	type form struct {
		CurrentPassword string `json:"currentPassword" valid:"stringlength(8|50),required"`
		NewPassword     string `json:"newPassword" valid:"stringlength(8|50),required"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		claims := middlewares.ClaimsFromCtx(r.Context())
		var f form
		defer r.Body.Close()

		if err := lib.DecodeJSON(r.Body, &f); err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		if _, err := govalidator.ValidateStruct(r); err != nil {
			render.BadRequestError(w, err.Error())
			return
		}

		if err := users.UpdatePassword(claims.ID, f.CurrentPassword, f.NewPassword); err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		render.JSON(w, http.StatusOK, render.Empty{})
	}
}
