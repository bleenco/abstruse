package api

import (
	"net/http"
	"os"
	"path"
	"time"

	authpkg "github.com/bleenco/abstruse/internal/auth"
	"github.com/bleenco/abstruse/server/core"
	"github.com/bleenco/abstruse/server/registry"
	_ "github.com/bleenco/abstruse/server/ui" // user interface files
	"github.com/bleenco/abstruse/server/ws"
	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/jkuri/statik/fs"
	"go.uber.org/zap"
)

type router struct {
	*chi.Mux
	logger    *zap.Logger
	app       *core.App
	uploadDir string
}

func newRouter(logger *zap.Logger, app *core.App, uploadDir, wsAddr string) *router {
	router := &router{chi.NewRouter(), logger, app, uploadDir}
	cfg := app.GetConfig()

	router.Use(middleware.RequestID)
	router.Use(middleware.RealIP)
	router.Use(middleware.Recoverer)
	router.Use(middleware.Timeout(60 * time.Second))

	router.Mount("/api/v1", router.apiRouter())
	router.Get("/ws", ws.UpstreamHandler(wsAddr))
	router.Mount("/uploads", router.fileServer())
	router.Mount("/registry", registry.Handler(cfg.Registry))
	router.Mount("/v2", http.HandlerFunc(registry.Proxy))
	router.NotFound(router.ui())

	return router
}

func (r *router) apiRouter() *chi.Mux {
	router := chi.NewRouter()
	middlewares := newMiddlewares(r.logger)

	router.Mount("/setup", r.setupRouter())
	router.Mount("/auth", r.authRouter())

	router.Group(func(router chi.Router) {
		router.Use(authpkg.JWT.Verifier(), middlewares.authenticator)
		router.Mount("/users", r.usersRouter())
		router.Mount("/providers", r.providersRouter())
		router.Mount("/repos", r.reposRouter())
		router.Mount("/builds", r.buildsRouter())
		router.Mount("/workers", r.workersRouter())
		router.Mount("/images", r.imagesRouter())
		router.Mount("/system", r.systemRouter())
	})

	return router
}

func (r *router) setupRouter() *chi.Mux {
	router := chi.NewRouter()
	setup := newSetup(r.logger, r.app)
	middlewares := newMiddlewares(r.logger)

	router.Get("/ready", setup.ready())

	router.Group(func(router chi.Router) {
		router.Use(middlewares.setupAuthenticator)
		router.Get("/config", setup.config())
		router.Post("/db/test", setup.testDatabaseConnection())
		router.Put("/auth", setup.auth())
		router.Put("/db", setup.db())
		router.Put("/etcd", setup.etcd())
		router.Post("/user", setup.user())
	})

	return router
}

func (r *router) authRouter() *chi.Mux {
	router := chi.NewRouter()
	auth := newAuth(r.logger)
	middlewares := newMiddlewares(r.logger)

	router.Post("/login", auth.login())
	router.Post("/logout", auth.logout())

	router.Group(func(router chi.Router) {
		router.Use(authpkg.JWT.Verifier(), middlewares.authenticateRefreshToken)
		router.Post("/token", auth.token())
	})

	return router
}

func (r *router) usersRouter() *chi.Mux {
	router := chi.NewRouter()
	users := newUsers(r.logger)

	router.Get("/sessions", users.sessions())
	router.Get("/profile", users.profile())
	router.Put("/profile", users.saveProfile())
	router.Put("/password", users.password())
	router.Post("/avatar", users.uploadAvatar(r.uploadDir))

	return router
}

func (r *router) providersRouter() *chi.Mux {
	router := chi.NewRouter()
	providers := newProviders(r.logger)

	router.Get("/", providers.find())
	router.Post("/", providers.create())
	router.Put("/", providers.update())
	router.Put("/sync", providers.sync())

	return router
}

func (r *router) reposRouter() *chi.Mux {
	router := chi.NewRouter()
	repos := newRepos(r.logger)

	router.Get("/", repos.find())
	router.Get("/{id}", repos.findByID())
	router.Put("/{id}/active", repos.setActive())
	router.Get("/{id}/hooks", repos.hooks())
	router.Put("/{id}/hooks", repos.createHooks())

	return router
}

func (r *router) buildsRouter() *chi.Mux {
	router := chi.NewRouter()
	builds := newBuilds(r.app)

	router.Get("/", builds.find())
	router.Get("/{id}", builds.findBuild())
	router.Put("/trigger", builds.triggerBuild())
	router.Put("/restart", builds.restartBuild())
	router.Put("/stop", builds.stopBuild())
	router.Get("/job/{id}", builds.findJob())
	router.Put("/job/restart", builds.restartJob())
	router.Put("/job/stop", builds.stopJob())

	return router
}

func (r *router) imagesRouter() *chi.Mux {
	router := chi.NewRouter()
	cfg := r.app.GetConfig()
	images := newImages(cfg.Registry, r.app)

	router.Get("/", images.find())
	router.Put("/sync", images.sync())
	router.Post("/build", images.build())

	return router
}

func (r *router) systemRouter() *chi.Mux {
	router := chi.NewRouter()
	system := newSystem(r.logger)

	router.Get("/version", system.version())

	return router
}

func (r *router) workersRouter() *chi.Mux {
	router := chi.NewRouter()
	workers := newWorkers(r.app)

	router.Get("/", workers.find())

	return router
}

func (r *router) ui() http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		root, _ := fs.New()
		fs := http.FileServer(&statikWrapper{root})
		fs.ServeHTTP(w, r)
	})
}

func (r *router) fileServer() *chi.Mux {
	router := chi.NewRouter()
	fs := http.FileServer(http.Dir(r.uploadDir))

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
