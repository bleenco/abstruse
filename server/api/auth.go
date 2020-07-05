package api

import (
	"net/http"

	"github.com/ractol/ractol/pkg/lib"
	"github.com/ractol/ractol/pkg/render"
	authpkg "github.com/ractol/ractol/server/auth"
	"github.com/ractol/ractol/server/db/model"
	"github.com/ractol/ractol/server/db/repository"
)

type auth struct{}

func (a *auth) login() http.HandlerFunc {
	type form struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	type resp struct {
		Token        string `json:"token"`
		RefreshToken string `json:"refreshToken"`
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var f form
		defer r.Body.Close()

		if err := lib.DecodeJSON(r.Body, &f); err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		userRepo := repository.NewUserRepo()
		tokenRepo := repository.NewTokenRepo()

		user, token, refreshToken, err := userRepo.Login(f.Email, f.Password)
		if err != nil {
			render.JSON(w, http.StatusUnauthorized, render.Error{Message: err.Error()})
			return
		}

		payload, err := authpkg.GetRefreshTokenData(refreshToken)
		if err != nil {
			render.JSON(w, http.StatusUnauthorized, render.Error{Message: err.Error()})
			return
		}

		tokenModel := model.Token{Token: refreshToken, ExpiresAt: payload.ExpiresAt, UserID: user.ID}
		if _, err := tokenRepo.Create(tokenModel); err != nil {
			render.JSON(w, http.StatusUnauthorized, render.Error{Message: err.Error()})
			return
		}

		render.JSON(w, http.StatusOK, resp{Token: token, RefreshToken: refreshToken})
	})
}
