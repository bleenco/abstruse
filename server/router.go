package server

import (
	"log"
	"net/http"
	"os"
	"path"

	"github.com/bleenco/abstruse/server/api"
	"github.com/bleenco/abstruse/server/api/builds"
	"github.com/bleenco/abstruse/server/api/integration"
	"github.com/bleenco/abstruse/server/api/providers/github"
	"github.com/bleenco/abstruse/server/api/repos"
	"github.com/bleenco/abstruse/server/api/setup"
	"github.com/bleenco/abstruse/server/api/teams"
	"github.com/bleenco/abstruse/server/api/user"
	"github.com/bleenco/abstruse/server/api/workers"
	_ "github.com/bleenco/abstruse/server/ui" // Web UI binary data.
	"github.com/bleenco/abstruse/server/websocket"
	"github.com/jkuri/statik/fs"
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
	r.Router.POST("/api/builds/trigger", api.AuthorizationMiddleware(builds.TriggerBuildHandler))
	r.Router.GET("/api/builds/info/:id", builds.FindBuildInfoHandler)
	r.Router.GET("/api/builds/current/:id", api.AuthorizationMiddleware(builds.FindCurrentByRepoHandler))
	r.Router.GET("/api/builds/repo/:id", api.AuthorizationMiddleware(builds.FindBuildsByRepoHandler))
	r.Router.GET("/api/builds/job/:id", api.AuthorizationMiddleware(builds.FindJobInfoHandler))
	r.Router.GET("/api/teams", api.AuthorizationMiddleware(teams.FetchTeamsHandler))
	r.Router.GET("/api/teams/:id", api.AuthorizationMiddleware(teams.FetchTeamHandler))
	r.Router.POST("/api/teams/:id", api.AuthorizationMiddleware(teams.SaveTeamHandler))
	r.Router.GET("/api/users/personal", api.AuthorizationMiddleware(user.FetchPersonalInfo))
}

func (r *Router) initUI() {
	statikFS, err := fs.New()
	if err != nil {
		log.Fatal(err)
	}

	r.Router.NotFound = http.FileServer(&statikWrapper{statikFS})
}

func (r *Router) initWebsocket() {
	r.Router.GET("/ws", websocket.UpstreamHandler("127.0.0.1:7100"))
}

type statikWrapper struct {
	assets http.FileSystem
}

// Open method.
func (sw *statikWrapper) Open(name string) (http.File, error) {
	ret, err := sw.assets.Open(name)
	if !os.IsNotExist(err) || path.Ext(name) != "" {
		return ret, err
	}

	return sw.assets.Open("/index.html")
}
