package user

import (
	"net/http"

	"github.com/asaskevich/govalidator"
	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/server/api/middlewares"
	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/core"
)

// HandleCreate returns an http.HandlerFunc that write JSON encoded
// result about creating user to the http response body.
func HandleCreate(users core.UserStore) http.HandlerFunc {
	type form struct {
		Login    string `json:"login" valid:"stringlength(3|50),required"`
		Email    string `json:"email" valid:"email,required"`
		Password string `json:"password" valid:"stringlength(8|50),required"`
		Name     string `json:"name" valid:"stringlength(3|50),required"`
		Avatar   string `json:"avatar" valid:"stringlength(5|255),required"`
		Role     string `json:"role" valid:"required"`
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

		user := &core.User{
			Login:    f.Login,
			Email:    f.Email,
			Password: f.Password,
			Name:     f.Name,
			Avatar:   f.Avatar,
			Role:     f.Role,
		}

		err = users.Create(user)
		if err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		render.JSON(w, http.StatusOK, user)
	}
}
