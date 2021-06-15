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

// HandleUpdate returns http.HandlerFunc that writes JSON encoded
// result about updated user to the http response body.
func HandleUpdate(users core.UserStore) http.HandlerFunc {
	type form struct {
		ID       uint   `json:"id" valid:"required"`
		Login    string `json:"login" valid:"stringlength(3|50),required"`
		Email    string `json:"email" valid:"email,required"`
		Password string `json:"password"`
		Name     string `json:"name" valid:"stringlength(3|50),required"`
		Avatar   string `json:"avatar" valid:"stringlength(5|255),required"`
		Role     string `json:"role" valid:"required"`
	}

	type resp struct {
		Token string `json:"token"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		claims := middlewares.ClaimsFromCtx(r.Context())
		var f form
		var err error
		defer r.Body.Close()

		u, err := users.Find(claims.ID)
		if err != nil || u.Role != "admin" {
			render.UnathorizedError(w, err.Error())
			return
		}

		if err := lib.DecodeJSON(r.Body, &f); err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		if valid, err := govalidator.ValidateStruct(f); err != nil || !valid {
			render.BadRequestError(w, err.Error())
			return
		}

		user, err := users.Find(f.ID)
		if err != nil {
			render.NotFoundError(w, err.Error())
			return
		}

		user.Login = f.Login
		user.Email = f.Email
		user.Name = f.Name
		user.Avatar = f.Avatar
		user.Role = f.Role

		if f.Password != "" {
			hash, err := auth.HashPassword(auth.Password{Password: f.Password})
			if err != nil {
				render.InternalServerError(w, err.Error())
				return
			}
			user.Password = hash
		}

		err = users.Update(user)
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
