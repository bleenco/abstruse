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
)

type router struct {
	*chi.Mux
}

type statikWrapper struct {
	assets http.FileSystem
}

func newRouter() *router {
	router := &router{chi.NewRouter()}

	router.Use(middleware.RequestID)
	router.Use(middleware.RealIP)
	router.Use(middleware.Recoverer)
	router.Use(middleware.Timeout(30 * time.Second))

	router.Mount("/api/v1", apiRouter())
	router.NotFound(ui())

	return router
}

func apiRouter() *chi.Mux {
	router := chi.NewRouter()
	middlewares := &middlewares{}

	router.Mount("/auth", authRouter())

	router.Group(func(router chi.Router) {
		router.Use(authpkg.JWT.Verifier(), middlewares.authenticator)
		router.Mount("/users", usersRouter())
		router.Mount("/system", systemRouter())
	})

	return router
}

func authRouter() *chi.Mux {
	router := chi.NewRouter()
	auth := &auth{}
	middlewares := &middlewares{}

	router.Post("/login", auth.login())

	router.Group(func(router chi.Router) {
		router.Use(middlewares.authenticateRefreshToken)
		router.Post("/token", auth.token())
	})

	return router
}

func usersRouter() *chi.Mux {
	router := chi.NewRouter()

	return router
}

func systemRouter() *chi.Mux {
	router := chi.NewRouter()
	system := &system{}

	router.Get("/version", system.version())

	return router
}

func ui() http.HandlerFunc {
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
