package server

import (
	"net/http"

	"github.com/bleenco/abstruse/api"
	"github.com/bleenco/abstruse/api/integration"
	"github.com/bleenco/abstruse/fs"
	"github.com/bleenco/abstruse/setup"
	"github.com/bleenco/abstruse/user"
	"github.com/julienschmidt/httprouter"
)

// Router represents main HTTP router.
type Router struct {
	*httprouter.Router
}

// NewRouter returns new instance of main HTTP router.
func NewRouter() *Router {
	router := &Router{httprouter.New()}
	router.initAPI()
	router.initUI()

	return router
}

func (r *Router) initAPI() {
	r.Router.GET("/api/setup/ready", setup.ReadyHandler)
	r.Router.POST("/api/user/login", user.LoginHandler)
	r.Router.POST("/api/integrations/github/add", api.AuthorizationMiddleware(integration.AddGitHubIntegration))
	r.Router.GET("/api/integrations", api.AuthorizationMiddleware(integration.FindIntegrationsHandler))
	r.Router.GET("/api/integrations/update/:integrationID", api.AuthorizationMiddleware(integration.UpdateGitHubIntegration))
}

func (r *Router) initUI() {
	r.Router.NotFound = http.FileServer(&spaWrapper{fs.StatikFS})
}
