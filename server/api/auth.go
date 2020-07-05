package api

import (
	"fmt"
	"net/http"
	"time"

	"github.com/mssola/user_agent"
	"github.com/ractol/ractol/pkg/lib"
	"github.com/ractol/ractol/pkg/render"
	authpkg "github.com/ractol/ractol/server/auth"
	"github.com/ractol/ractol/server/db/model"
	"github.com/ractol/ractol/server/db/repository"
	"go.uber.org/zap"
)

type auth struct {
	logger *zap.SugaredLogger
}

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

		user, err := userRepo.Login(f.Email, f.Password)
		if err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		ua := user_agent.New(r.UserAgent())
		browser, browserVersion := ua.Browser()
		engine, engineVersion := ua.Engine()
		token := model.Token{
			UserID:   user.ID,
			OS:       fmt.Sprintf("%s %s", ua.OSInfo().Name, ua.OSInfo().Version),
			Browser:  fmt.Sprintf("%s %s", browser, browserVersion),
			Engine:   fmt.Sprintf("%s %s", engine, engineVersion),
			Platform: ua.Platform(),
			Mobile:   ua.Mobile(),
			IP:       r.RemoteAddr,
		}

		token, err = tokenRepo.CreateOrUpdate(token)
		if err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		userToken, refreshToken, err := authpkg.JWT.GenerateTokenPair(user.Claims(), token.Claims())
		if err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		render.JSON(w, http.StatusOK, resp{Token: userToken, RefreshToken: refreshToken})
	})
}

func (a *auth) token() http.HandlerFunc {
	type resp struct {
		Token        string `json:"token"`
		RefreshToken string `json:"refreshToken"`
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		rt := refreshTokenFromCtx(r.Context())
		tokenRepo := repository.NewTokenRepo()
		userRepo := repository.NewUserRepo()

		token, err := tokenRepo.FindByToken(rt)
		if err != nil {
			render.JSON(w, http.StatusUnauthorized, render.Error{Message: err.Error()})
			return
		}

		if time.Now().After(token.ExpiresAt) {
			if err := tokenRepo.Delete(token); err != nil {
				// log error
			}
			render.JSON(w, http.StatusUnauthorized, render.Error{Message: "token expired"})
			return
		}

		user, err := userRepo.Find(token.UserID)
		if err != nil {
			render.JSON(w, http.StatusUnauthorized, render.Error{Message: "unknown user"})
			return
		}

		if !user.IsActive() {
			render.JSON(w, http.StatusUnauthorized, render.Error{Message: "user deactivated"})
			return
		}

		token, err = tokenRepo.CreateOrUpdate(token)
		if err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		user.LastLogin = time.Now()
		user, err = userRepo.Update(user)
		if err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		userToken, refreshToken, err := authpkg.JWT.GenerateTokenPair(user.Claims(), token.Claims())
		if err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		render.JSON(w, http.StatusOK, resp{Token: userToken, RefreshToken: refreshToken})
	})
}
