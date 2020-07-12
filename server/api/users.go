package api

import (
	"net/http"
	"strings"

	"github.com/asaskevich/govalidator"
	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/pkg/render"
	"github.com/bleenco/abstruse/server/db/model"
	"github.com/bleenco/abstruse/server/db/repository"
	"go.uber.org/zap"
)

type users struct {
	logger    *zap.SugaredLogger
	userRepo  repository.UserRepo
	tokenRepo repository.TokenRepo
}

func newUsers(logger *zap.Logger) users {
	return users{
		logger:    logger.With(zap.String("api", "users")).Sugar(),
		userRepo:  repository.NewUserRepo(),
		tokenRepo: repository.NewTokenRepo(),
	}
}

func (u *users) profile() http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		claims := claimsFromCtx(r.Context())

		user, err := u.userRepo.Find(claims.ID)
		if err != nil {
			render.JSON(w, http.StatusNotFound, render.Error{Message: err.Error()})
			return
		}

		render.JSON(w, http.StatusOK, user)
	})
}

func (u *users) saveProfile() http.HandlerFunc {
	type form struct {
		Email    string `json:"email" valid:"email,required"`
		Name     string `json:"name" valid:"stringlength(3|50),required"`
		Avatar   string `json:"avatar" valid:"stringlength(5|255),required"`
		Location string `json:"location"`
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		claims := claimsFromCtx(r.Context())
		var f form
		var err error

		if err := lib.DecodeJSON(r.Body, &f); err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		if valid, err := govalidator.ValidateStruct(f); err != nil || !valid {
			render.JSON(w, http.StatusBadRequest, render.Error{Message: err.Error()})
			return
		}

		user := model.User{
			ID:       claims.ID,
			Email:    f.Email,
			Name:     f.Name,
			Avatar:   f.Avatar,
			Location: f.Location,
		}

		user, err = u.userRepo.Update(user)
		if err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		render.JSON(w, http.StatusOK, user)
	})
}

func (u *users) sessions() http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		claims := claimsFromCtx(r.Context())

		sessions, err := u.tokenRepo.Find(claims.ID)
		if err != nil {
			if !strings.HasPrefix(err.Error(), "database") {
				render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
				return
			}

			render.JSON(w, http.StatusNotFound, render.Error{Message: err.Error()})
			return
		}

		render.JSON(w, http.StatusOK, sessions)
	})
}

func (u *users) password() http.HandlerFunc {
	type form struct {
		CurrentPassword string `json:"currentPassword" valid:"stringlength(8|50),required"`
		NewPassword     string `json:"newPassword" valid:"stringlength(8|50),required"`
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var f form
		claims := claimsFromCtx(r.Context())
		defer r.Body.Close()

		if err := lib.DecodeJSON(r.Body, &f); err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		if err := u.userRepo.UpdatePassword(claims.ID, f.CurrentPassword, f.NewPassword); err != nil {
			render.JSON(w, http.StatusForbidden, render.Error{Message: err.Error()})
			return
		}

		if _, err := govalidator.ValidateStruct(r); err != nil {
			render.JSON(w, http.StatusBadRequest, render.Error{Message: err.Error()})
			return
		}

		render.JSON(w, http.StatusOK, render.Empty{})
	})
}
