package api

import (
	"net/http"

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
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		render.JSON(w, http.StatusOK, sessions)
	})
}
