package user

import (
	"net/http"

	"github.com/asaskevich/govalidator"
	"github.com/bleenco/abstruse/internal/auth"
	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/server/api/middlewares"
	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/core"
)

// HandleUpdateProfile returns http.HandlerFunc that writes JSON encoded
// result about updated user profile to the http response body.
func HandleUpdateProfile(users core.UserStore) http.HandlerFunc {
	type form struct {
		Login  string `json:"login" valid:"stringlength(3|50),required"`
		Email  string `json:"email" valid:"email,required"`
		Name   string `json:"name" valid:"stringlength(3|50),required"`
		Avatar string `json:"avatar" valid:"stringlength(5|255),required"`
	}

	type resp struct {
		Token string `json:"token"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		claims := middlewares.ClaimsFromCtx(r.Context())
		var f form
		var err error
		defer r.Body.Close()

		if err := lib.DecodeJSON(r.Body, &f); err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		if valid, err := govalidator.ValidateStruct(f); err != nil || !valid {
			render.BadRequestError(w, err.Error())
			return
		}

		user := &core.User{
			ID:     claims.ID,
			Login:  f.Login,
			Email:  f.Email,
			Name:   f.Name,
			Avatar: f.Avatar,
		}

		err = users.Update(user)
		if err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		user, err = users.Find(claims.ID)
		if err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		token, err := auth.JWT.CreateJWT(user.Claims())
		if err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		render.JSON(w, http.StatusOK, resp{Token: token})
	}
}
