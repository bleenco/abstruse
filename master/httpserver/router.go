package httpserver

import (
	"log"
	"net/http"

	_ "github.com/jkuri/abstruse/master/ui" // web ui
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
	// router.initWebsocket()
	// router.initAPI()
	router.initUI()

	return router
}

func (r *Router) initUI() {
	statikFS, err := fs.New()
	if err != nil {
		log.Fatal(err)
	}

	r.Router.NotFound = http.FileServer(&statikWrapper{statikFS})
}
