package api

import (
	"fmt"
	"net"
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
	logger    *zap.SugaredLogger
	userRepo  repository.UserRepo
	tokenRepo repository.TokenRepo
}

func newAuth(logger *zap.Logger) auth {
	a := auth{
		logger:    logger.With(zap.Field(zap.String("api", "auth"))).Sugar(),
		userRepo:  repository.NewUserRepo(),
		tokenRepo: repository.NewTokenRepo(),
	}
	a.choresTicker()

	return a
}

func (a *auth) login() http.HandlerFunc {
	type form struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	type resp struct {
		AccessToken  string `json:"accessToken"`
		RefreshToken string `json:"refreshToken"`
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var f form
		defer r.Body.Close()

		if err := lib.DecodeJSON(r.Body, &f); err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		user, err := a.userRepo.Login(f.Email, f.Password)
		if err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		ua := user_agent.New(r.UserAgent())
		browser, browserVersion := ua.Browser()
		engine, engineVersion := ua.Engine()
		ip, _, serr := net.SplitHostPort(r.RemoteAddr)
		if serr != nil {
			ip = r.RemoteAddr
		}

		token := model.Token{
			UserID:   user.ID,
			OS:       fmt.Sprintf("%s %s", ua.OSInfo().Name, ua.OSInfo().Version),
			Browser:  fmt.Sprintf("%s %s", browser, browserVersion),
			Engine:   fmt.Sprintf("%s %s", engine, engineVersion),
			Platform: ua.Platform(),
			Mobile:   ua.Mobile(),
			IP:       ip,
		}

		token, err = a.tokenRepo.CreateOrUpdate(token)
		if err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		userToken, refreshToken, err := authpkg.JWT.GenerateTokenPair(user.Claims(), token.Claims())
		if err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		render.JSON(w, http.StatusOK, resp{AccessToken: userToken, RefreshToken: refreshToken})
	})
}

func (a *auth) logout() http.HandlerFunc {
	type form struct {
		RefreshToken string `json:"refreshToken"`
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var f form
		defer r.Body.Close()

		if err := lib.DecodeJSON(r.Body, &f); err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		token, err := a.tokenRepo.FindByToken(f.RefreshToken)
		if err != nil {
			a.logger.Warnf("could not find refresh token: %v", err)
		} else {
			if err := a.tokenRepo.Delete(token); err != nil {
				a.logger.Warnf("could not delete refresh token: %v", err)
			}
		}

		render.JSON(w, http.StatusOK, render.Empty{})
	})
}

func (a *auth) token() http.HandlerFunc {
	type resp struct {
		AccessToken  string `json:"accessToken"`
		RefreshToken string `json:"refreshToken"`
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		rt := refreshTokenFromCtx(r.Context())

		token, err := a.tokenRepo.FindByToken(rt)
		if err != nil {
			render.JSON(w, http.StatusUnauthorized, render.Error{Message: err.Error()})
			return
		}

		if time.Now().After(token.ExpiresAt) {
			if err := a.tokenRepo.Delete(token); err != nil {
				// log error
			}
			render.JSON(w, http.StatusUnauthorized, render.Error{Message: "token expired"})
			return
		}

		user, err := a.userRepo.Find(token.UserID)
		if err != nil {
			render.JSON(w, http.StatusUnauthorized, render.Error{Message: "unknown user"})
			return
		}

		if !user.IsActive() {
			render.JSON(w, http.StatusUnauthorized, render.Error{Message: "user deactivated"})
			return
		}

		token, err = a.tokenRepo.CreateOrUpdate(token)
		if err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		user.LastLogin = time.Now()
		user, err = a.userRepo.Update(user)
		if err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		userToken, refreshToken, err := authpkg.JWT.GenerateTokenPair(user.Claims(), token.Claims())
		if err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		render.JSON(w, http.StatusOK, resp{AccessToken: userToken, RefreshToken: refreshToken})
	})
}

func (a *auth) choresTicker() {
	ticker := time.NewTicker(20 * time.Minute)
	go func() {
		if err := a.tokenRepo.DeleteExpired(); err != nil {
			a.logger.Errorf("error while deleting expired refresh tokens: %v", err)
		}

		for range ticker.C {
			if err := a.tokenRepo.DeleteExpired(); err != nil {
				a.logger.Errorf("error while deleting expired refresh tokens: %v", err)
			}
		}
	}()
}
