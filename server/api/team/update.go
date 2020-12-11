package team

import (
	"net/http"

	"github.com/asaskevich/govalidator"
	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/core"
)

// HandleUpdate returns an http.HandlerFunc that writes JSON encoded
// result about updating team to the http response body.
func HandleUpdate(teams core.TeamStore, users core.UserStore) http.HandlerFunc {
	type form struct {
		ID      uint   `json:"id" valid:"required"`
		Name    string `json:"name" valid:"required"`
		About   string `json:"about" valid:"required"`
		Color   string `json:"color" valid:"required"`
		Members []uint `json:"members"`
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

		team, err := teams.Find(f.ID)
		if err != nil {
			render.NotFoundError(w, err.Error())
			return
		}

		team.Name = f.Name
		team.About = f.About
		team.Color = f.Color

		if err := teams.Update(team); err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		var members []*core.User
		for _, id := range f.Members {
			if user, err := users.Find(id); err == nil {
				members = append(members, user)
			}
		}

		if err := teams.UpdateUsers(team.ID, members); err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		render.JSON(w, http.StatusOK, team)
	}
}
