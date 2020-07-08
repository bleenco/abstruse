package api

import (
	"context"
	"net/http"

	"github.com/ractol/ractol/pkg/render"
	authpkg "github.com/ractol/ractol/server/auth"
	"github.com/ractol/ractol/server/db"
	"github.com/ractol/ractol/server/db/repository"
	"go.uber.org/zap"
)

type ctxKey int

const (
	ctxClaims ctxKey = iota
	ctxRefreshToken
)

type middlewares struct {
	logger   *zap.SugaredLogger
	userRepo repository.UserRepo
}

func newMiddlewares(logger *zap.Logger) middlewares {
	return middlewares{
		logger:   logger.With(zap.String("api", "middleware")).Sugar(),
		userRepo: repository.NewUserRepo(),
	}
}

func (m *middlewares) authenticator(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token, claims, err := authpkg.FromContext(r.Context())

		if err != nil {
			render.JSON(w, http.StatusUnauthorized, render.Error{Message: err.Error()})
			return
		}

		if !token.Valid {
			render.JSON(w, http.StatusUnauthorized, render.Error{Message: "token expired"})
			return
		}

		var c authpkg.UserClaims
		if err := c.ParseClaims(claims); err != nil {
			render.JSON(w, http.StatusUnauthorized, render.Error{Message: "invalid access token"})
			return
		}

		ctx := context.WithValue(r.Context(), ctxClaims, c)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (m *middlewares) authenticateRefreshToken(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token, claims, err := authpkg.FromContext(r.Context())

		if err != nil {
			render.JSON(w, http.StatusUnauthorized, render.Error{Message: err.Error()})
			return
		}

		if !token.Valid {
			render.JSON(w, http.StatusUnauthorized, render.Error{Message: "token expired"})
			return
		}

		var c authpkg.RefreshClaims
		if err := c.ParseClaims(claims); err != nil {
			render.JSON(w, http.StatusUnauthorized, render.Error{Message: "invalid refresh token"})
			return
		}

		ctx := context.WithValue(r.Context(), ctxRefreshToken, c.Token)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func claimsFromCtx(ctx context.Context) authpkg.UserClaims {
	return ctx.Value(ctxClaims).(authpkg.UserClaims)
}

func refreshTokenFromCtx(ctx context.Context) string {
	return ctx.Value(ctxRefreshToken).(string)
}

func (m *middlewares) setupAuthenticator(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if _, err := db.Instance(); err != nil {
			next.ServeHTTP(w, r)
			return
		}

		exists, err := m.userRepo.AdminExists()
		if err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}
		if !exists {
			next.ServeHTTP(w, r)
			return
		}

		render.JSON(w, http.StatusForbidden, render.Empty{})
	})
}
