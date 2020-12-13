package api

import (
	"net/http"
	"os"
	"path"

	"github.com/bleenco/abstruse/internal/auth"
	"github.com/bleenco/abstruse/server/api/build"
	"github.com/bleenco/abstruse/server/api/middlewares"
	"github.com/bleenco/abstruse/server/api/provider"
	"github.com/bleenco/abstruse/server/api/repo"
	"github.com/bleenco/abstruse/server/api/setup"
	"github.com/bleenco/abstruse/server/api/system"
	"github.com/bleenco/abstruse/server/api/team"
	"github.com/bleenco/abstruse/server/api/user"
	"github.com/bleenco/abstruse/server/api/webhook"
	"github.com/bleenco/abstruse/server/api/worker"
	"github.com/bleenco/abstruse/server/config"
	"github.com/bleenco/abstruse/server/core"
	_ "github.com/bleenco/abstruse/server/ui" // user interface files
	"github.com/bleenco/abstruse/server/ws"
	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/cors"
	"github.com/jkuri/statik/fs"
)

var corsOpts = cors.Options{
	AllowedOrigins:   []string{"*"},
	AllowedMethods:   []string{"GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"},
	AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
	ExposedHeaders:   []string{"Link"},
	AllowCredentials: true,
	MaxAge:           300,
}

// New returns new API Router instance.
func New(
	config *config.Config,
	ws *ws.Server,
	users core.UserStore,
	teams core.TeamStore,
	permissions core.PermissionStore,
	providers core.ProviderStore,
	builds core.BuildStore,
	jobs core.JobStore,
	repos core.RepositoryStore,
	workers core.WorkerRegistry,
	scheduler core.Scheduler,
) *Router {
	return &Router{
		Config:      config,
		WS:          ws,
		Users:       users,
		Teams:       teams,
		Permissions: permissions,
		Providers:   providers,
		Builds:      builds,
		Jobs:        jobs,
		Repos:       repos,
		Workers:     workers,
		Scheduler:   scheduler,
	}
}

// Router is an API http.Handler.
type Router struct {
	Config      *config.Config
	WS          *ws.Server
	Users       core.UserStore
	Teams       core.TeamStore
	Permissions core.PermissionStore
	Providers   core.ProviderStore
	Builds      core.BuildStore
	Jobs        core.JobStore
	Repos       core.RepositoryStore
	Workers     core.WorkerRegistry
	Scheduler   core.Scheduler
}

// Handler returns the http.Handler.
func (r Router) Handler() http.Handler {
	router := chi.NewRouter()

	router.Use(middleware.RequestID)
	router.Use(middleware.Recoverer)
	router.Use(middleware.NoCache)
	router.Use(middleware.RealIP)
	router.Use(middleware.Heartbeat("/ping"))
	if r.Config.HTTP.Compress {
		router.Use(middleware.Compress(5))
	}

	cors := cors.New(corsOpts)
	router.Use(cors.Handler)

	router.Mount("/api/v1", r.apiRouter())
	router.Get("/ws", ws.UpstreamHandler(r.Config.Websocket.Addr))
	router.Mount("/uploads", r.fileServer())
	router.Post("/webhooks", webhook.HandleHook(r.Repos, r.Builds, r.Scheduler, r.WS))
	router.NotFound(r.ui())

	return router
}

func (r Router) apiRouter() *chi.Mux {
	router := chi.NewRouter()

	router.Mount("/setup", r.setupRouter())
	router.Mount("/auth", r.authRouter())
	router.Mount("/workers", r.workersRouter())

	router.Group(func(router chi.Router) {
		router.Use(auth.JWT.Verifier(), middlewares.Authenticator)
		router.Mount("/users", r.usersRouter())
		router.Mount("/teams", r.teamsRouter())
		router.Mount("/providers", r.providersRouter())
		router.Mount("/repos", r.reposRouter())
		router.Mount("/builds", r.buildsRouter())
		router.Mount("/system", r.systemRouter())
	})

	return router
}

func (r Router) authRouter() *chi.Mux {
	router := chi.NewRouter()

	router.Post("/login", user.HandleLogin(r.Users))

	return router
}

func (r Router) setupRouter() *chi.Mux {
	router := chi.NewRouter()

	router.Get("/ready", setup.HandleReady(r.Users))
	router.Group(func(router chi.Router) {
		router.Use(middlewares.SetupAuthenticator(r.Users))
		router.Post("/user", setup.HandleUser(r.Users))
	})

	return router
}

func (r Router) usersRouter() *chi.Mux {
	router := chi.NewRouter()

	router.Get("/", user.HandleList(r.Users))
	router.Post("/", user.HandleCreate(r.Users))
	router.Put("/", user.HandleUpdate(r.Users))
	router.Get("/profile", user.HandleProfile(r.Users))
	router.Put("/profile", user.HandleUpdateProfile(r.Users))
	router.Put("/password", user.HandlePassword(r.Users))
	router.Post("/avatar", user.HandleAvatar(r.Config.HTTP.UploadDir))

	return router
}

func (r Router) teamsRouter() *chi.Mux {
	router := chi.NewRouter()

	router.Get("/", team.HandleList(r.Teams))
	router.Get("/{id}", team.HandleFind(r.Teams))
	router.Post("/", team.HandleCreate(r.Teams, r.Users, r.Permissions))
	router.Put("/", team.HandleUpdate(r.Teams, r.Users, r.Permissions))

	return router
}

func (r Router) providersRouter() *chi.Mux {
	router := chi.NewRouter()

	router.Get("/", provider.HandleListUser(r.Providers))
	router.Post("/", provider.HandleCreate(r.Providers))
	router.Put("/", provider.HandleUpdate(r.Providers))
	router.Get("/{id}", provider.HandleFind(r.Providers))
	router.Put("/sync", provider.HandleSync(r.Providers))

	return router
}

func (r Router) reposRouter() *chi.Mux {
	router := chi.NewRouter()

	router.Get("/", repo.HandleList(r.Repos))
	router.Get("/{id}", repo.HandleFind(r.Repos))
	router.Put("/{id}/active", repo.HandleActive(r.Repos))
	router.Get("/{id}/hooks", repo.HandleListHooks(r.Repos))
	router.Put("/{id}/hooks", repo.HandleCreateHooks(r.Repos))
	router.Get("/{id}/config", repo.HandleConfig(r.Repos))

	return router
}

func (r Router) buildsRouter() *chi.Mux {
	router := chi.NewRouter()

	router.Get("/", build.HandleList(r.Builds))
	router.Get("/{id}", build.HandleFind(r.Builds))
	router.Put("/trigger", build.HandleTrigger(r.Builds, r.Scheduler, r.WS))
	router.Put("/restart", build.HandleRestart(r.Builds, r.Repos, r.Scheduler))
	router.Put("/stop", build.HandleStop(r.Builds, r.Repos, r.Scheduler))
	router.Get("/job/{id}", build.HandleFindJob(r.Jobs, r.Scheduler))
	router.Put("/job/restart", build.HandleRestartJob(r.Jobs, r.Repos, r.Scheduler))
	router.Put("/job/stop", build.HandleStopJob(r.Jobs, r.Repos, r.Scheduler))

	return router
}

func (r Router) workersRouter() *chi.Mux {
	router := chi.NewRouter()

	router.Get("/", worker.HandleList(r.Workers))
	router.Group(func(router chi.Router) {
		router.Use(auth.JWT.Verifier(), middlewares.WorkerAuthenticator)
		router.Post("/auth", worker.HandleAuth(r.Workers, r.Config, r.WS.App))
	})

	return router
}

func (r Router) systemRouter() *chi.Mux {
	router := chi.NewRouter()

	router.Get("/version", system.HandleVersion())

	return router
}

func (r Router) ui() http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		root, _ := fs.New()
		fs := http.FileServer(&statikWrapper{root})
		fs.ServeHTTP(w, r)
	})
}

func (r Router) fileServer() *chi.Mux {
	router := chi.NewRouter()
	fs := http.FileServer(http.Dir(r.Config.HTTP.UploadDir))

	router.Get("/*", func(w http.ResponseWriter, req *http.Request) {
		http.StripPrefix("/uploads/", fs).ServeHTTP(w, req)
	})

	return router
}

type statikWrapper struct {
	assets http.FileSystem
}

// Open returns file from http FileSystem by path,
// if file is not found fallbacks to /index.html.
func (sw *statikWrapper) Open(name string) (http.File, error) {
	ret, err := sw.assets.Open(name)
	if !os.IsNotExist(err) || path.Ext(name) != "" {
		return ret, err
	}

	return sw.assets.Open("/index.html")
}
