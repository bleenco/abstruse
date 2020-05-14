package httpserver

import "github.com/julienschmidt/httprouter"

// Router represents main HTTP router.
type Router struct {
	*httprouter.Router
}

// NewRouter returns new instance of main HTTP router.
func NewRouter() *Router {
	router := &Router{httprouter.New()}
	// router.initWebsocket()
	// router.initAPI()
	// router.initUI()

	return router
}
