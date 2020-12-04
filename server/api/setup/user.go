package setup

import (
	"net/http"

	"github.com/asaskevich/govalidator"
	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/core"
)

// HandleUser returns an http.HandlerFunc that writes JSON encoded
// result about creating initial user to the http response.
func HandleUser(users core.UserStore) http.HandlerFunc {
	type form struct {
		Email    string `json:"email" valid:"email,required"`
		Name     string `json:"name" valid:"stringlength(2|50),required"`
		Avatar   string `json:"avatar" valid:"stringlength(5|255),required"`
		Password string `json:"password" valid:"stringlength(8|50),required"`
		Role     string `json:"role" valid:"in(admin|user),required"`
		Active   bool   `json:"active"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		var f form
		defer r.Body.Close()

		if err := lib.DecodeJSON(r.Body, &f); err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		if valid, err := govalidator.ValidateStruct(f); err != nil || !valid {
			render.BadRequestError(w, err.Error())
			return
		}

		user := core.User{
			Email:    f.Email,
			Name:     f.Name,
			Avatar:   f.Avatar,
			Password: f.Password,
			Role:     f.Role,
			Active:   f.Active,
		}

		if err := users.Create(user); err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		render.JSON(w, http.StatusOK, render.Empty{})
	}
}
