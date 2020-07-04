package api

import (
	"net/http"
	"os"
	"path"

	"github.com/go-chi/chi"
	"github.com/jkuri/statik/fs"
	_ "github.com/ractol/ractol/internal/ui" // user interface files
)

type router struct {
	*chi.Mux
}

type statikWrapper struct {
	assets http.FileSystem
}

func newRouter() *router {
	router := &router{chi.NewRouter()}
	router.Mount("/api/v1", apiRouter())
	router.NotFound(ui())
	return router
}

func apiRouter() *chi.Mux {
	router := chi.NewRouter()
	router.Mount("/users", usersRouter())

	return router
}

func usersRouter() *chi.Mux {
	router := chi.NewRouter()
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
