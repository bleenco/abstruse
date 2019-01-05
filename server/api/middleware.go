package api

import (
	"net/http"

	"github.com/bleenco/abstruse/server/db"
	"github.com/julienschmidt/httprouter"
)

// AuthorizationMiddleware is authentication middleware.
func AuthorizationMiddleware(fn func(res http.ResponseWriter, req *http.Request, params httprouter.Params)) httprouter.Handle {
	return func(res http.ResponseWriter, req *http.Request, params httprouter.Params) {
		token := req.Header.Get("Authorization")
		if token == "" {
			JSONResponse(res, http.StatusUnauthorized, BoolResponse{Data: false})
			return
		}

		user := &db.User{}
		if ok := user.CheckUserJWT(token); !ok {
			JSONResponse(res, http.StatusUnauthorized, BoolResponse{Data: false})
			return
		}

		fn(res, req, params)
	}
}
