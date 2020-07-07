package api

import (
	"net/http"
	"os"
	"path"
	"time"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/jkuri/statik/fs"
	_ "github.com/ractol/ractol/internal/ui" // user interface files
	authpkg "github.com/ractol/ractol/server/auth"
	"go.uber.org/zap"
)

type router struct {
	*chi.Mux
	logger *zap.Logger
}

type statikWrapper struct {
	assets http.FileSystem
}

func newRouter(logger *zap.Logger) *router {
	router := &router{chi.NewRouter(), logger}

	router.Use(middleware.RequestID)
	router.Use(middleware.RealIP)
	router.Use(middleware.Recoverer)
	router.Use(middleware.Timeout(30 * time.Second))

	router.Mount("/api/v1", router.apiRouter())
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
		router.Mount("/system", r.systemRouter())
	})

	return router
}

func (r *router) setupRouter() *chi.Mux {
	router := chi.NewRouter()
	setup := newSetup(r.logger)

	router.Get("/ready", setup.ready())

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

	return router
}

func (r *router) systemRouter() *chi.Mux {
	router := chi.NewRouter()
	system := newSystem(r.logger)

	router.Get("/version", system.version())

	return router
}

func (r *router) ui() http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		root, _ := fs.New()
		fs := http.FileServer(&statikWrapper{root})
		fs.ServeHTTP(w, r)
	})
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
