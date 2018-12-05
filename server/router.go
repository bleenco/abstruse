package server

import (
	"net/http"

	"github.com/bleenco/abstruse/api"
	"github.com/bleenco/abstruse/api/repos"
	"github.com/bleenco/abstruse/api/user"
	"github.com/bleenco/abstruse/api/setup"
	"github.com/bleenco/abstruse/api/workers"
	"github.com/bleenco/abstruse/api/teams"
	"github.com/bleenco/abstruse/api/integration"
	"github.com/bleenco/abstruse/api/providers/github"
	"github.com/bleenco/abstruse/fs"
	"github.com/bleenco/abstruse/server/websocket"
	"github.com/julienschmidt/httprouter"
)

// Router represents main HTTP router.
type Router struct {
	*httprouter.Router
}

// NewRouter returns new instance of main HTTP router.
func NewRouter() *Router {
	router := &Router{httprouter.New()}
	router.initWebsocket()
	router.initAPI()
	router.initUI()

	return router
}

func (r *Router) initAPI() {
	r.Router.GET("/api/setup/ready", setup.ReadyHandler)
	r.Router.POST("/api/user/login", user.LoginHandler)
	r.Router.GET("/api/version", api.AuthorizationMiddleware(FindVersionHandler))
	r.Router.GET("/api/integrations", api.AuthorizationMiddleware(integration.FindIntegrationsHandler))
	r.Router.GET("/api/integrations/:id", api.AuthorizationMiddleware(integration.FindIntegrationHandler))
	r.Router.GET("/api/integrations/:id/update", api.AuthorizationMiddleware(integration.UpdateGitHubIntegration))
	r.Router.GET("/api/integrations/:id/repos", api.AuthorizationMiddleware(integration.FetchIntegrationRepositoriesHandler))
	r.Router.POST("/api/integrations/github/add", api.AuthorizationMiddleware(integration.AddGitHubIntegration))
	r.Router.POST("/api/integrations/github/import/:id", api.AuthorizationMiddleware(github.ImportRepositoryHandler))
	r.Router.GET("/api/workers", api.AuthorizationMiddleware(workers.FindAllHandler))
	r.Router.GET("/api/repositories", api.AuthorizationMiddleware(repos.FetchRepositoriesHandler))
	r.Router.GET("/api/repositories/:id", api.AuthorizationMiddleware(repos.FetchRepositoryHandler))
	r.Router.GET("/api/repositories/:id/hooks", api.AuthorizationMiddleware(github.ListHooksHandler))
	r.Router.POST("/api/repositories/:id/hooks", api.AuthorizationMiddleware(github.CreateHookHandler))
	r.Router.POST("/api/builds/trigger", api.AuthorizationMiddleware(TriggerBuildHandler))
	r.Router.GET("/api/teams", api.AuthorizationMiddleware(teams.FetchTeamsHandler))
	r.Router.POST("/api/teams/:id", api.AuthorizationMiddleware(teams.SaveTeamHandler))
}

func (r *Router) initUI() {
	r.Router.NotFound = http.FileServer(&spaWrapper{fs.StatikFS})
}

func (r *Router) initWebsocket() {
	r.Router.GET("/ws", websocket.UpstreamHandler("127.0.0.1:7100"))
}