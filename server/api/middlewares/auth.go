package middlewares

import (
	"context"
	"net/http"

	"github.com/bleenco/abstruse/internal/auth"
	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/core"
)

type ctxKey int

const ctxClaims ctxKey = iota

// Authenticator middleware.
func Authenticator(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token, claims, err := auth.FromContext(r.Context())

		if err != nil {
			render.UnathorizedError(w, err.Error())
			return
		}

		if !token.Valid {
			render.UnathorizedError(w, "token expired")
			return
		}

		var c auth.UserClaims
		if err := c.ParseClaims(claims); err != nil {
			render.UnathorizedError(w, "invalid access token")
			return
		}

		ctx := context.WithValue(r.Context(), ctxClaims, c)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// ClaimsFromCtx returns user claims from context.
func ClaimsFromCtx(ctx context.Context) auth.UserClaims {
	return ctx.Value(ctxClaims).(auth.UserClaims)
}

// WorkerAuthenticator middleware.
func WorkerAuthenticator(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token, claims, err := auth.FromContext(r.Context())

		if err != nil {
			render.UnathorizedError(w, err.Error())
			return
		}

		if !token.Valid {
			render.UnathorizedError(w, "token expired")
			return
		}

		var c auth.WorkerClaims
		if err := c.ParseClaims(claims); err != nil {
			render.UnathorizedError(w, "invalid access token")
			return
		}

		ctx := context.WithValue(r.Context(), ctxClaims, c)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// WorkerClaimsFromCtx returns worker claims from context.
func WorkerClaimsFromCtx(ctx context.Context) auth.WorkerClaims {
	return ctx.Value(ctxClaims).(auth.WorkerClaims)
}

// SetupAuthenticator middleware.
func SetupAuthenticator(users core.UserStore) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if !users.AdminExists() {
				next.ServeHTTP(w, r)
				return
			}

			render.ForbiddenError(w, "user with role admin already exists")
		})
	}
}
