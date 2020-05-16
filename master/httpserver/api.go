package httpserver

import (
	"github.com/jkuri/abstruse/master/api"
)

func (r *Router) initAPI() {
	r.Router.POST("/api/user/login", api.LoginHandler)
	r.Router.GET("/api/version", api.FindVersionHandler)
	r.Router.GET("/api/workers", api.GetWorkersHandler)
}
