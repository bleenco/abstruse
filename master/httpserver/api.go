package httpserver

import (
	"github.com/jkuri/abstruse/master/api"
)

func (r *Router) initAPI() {
	r.Router.POST("/api/user/login", api.LoginHandler)
}
