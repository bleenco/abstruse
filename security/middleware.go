package security

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

// AuthorizationMiddleware is authentication middleware.
func AuthorizationMiddleware() func(httprouter.Handle) httprouter.Handle {
	return func(fn httprouter.Handle) httprouter.Handle {
		return func(res http.ResponseWriter, req *http.Request, params httprouter.Params) {
			token := req.Header.Get("Authorization")
			if token == "" {
				http.Error(res, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
				return
			}
			// user := &db.User{}
			// if err := user.CheckUserJWT(token); err != nil {
			// 	http.Error(res, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
			// 	return
			// }

			fn(res, req, params)
		}
	}
}
