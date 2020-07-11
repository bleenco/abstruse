package api

import (
	"net/http"
	"strings"

	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/pkg/render"
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
		CurrentPassword string `json:"currentPassword"`
		NewPassword     string `json:"newPassword"`
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

		render.JSON(w, http.StatusOK, render.Empty{})
	})
}
