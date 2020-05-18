package http

import (
	"net/http"

	_ "github.com/jkuri/abstruse/internal/server/ui" // web ui
	"github.com/jkuri/abstruse/internal/server/websocket"
	"github.com/jkuri/statik/fs"
	"github.com/julienschmidt/httprouter"
)

// Router represents main HTTP router.
type Router struct {
	*httprouter.Router
}

type InitControllers func(r *Router)

// NewRouter returns new instance of router.
func NewRouter(opts *Options, wsOpts *websocket.Options, init InitControllers) *Router {
	r := &Router{httprouter.New()}
	init(r)
	r.initUI()
	r.initWS(wsOpts)

	return r
}

func (r *Router) initUI() {
	statikFS, _ := fs.New()
	r.Router.NotFound = http.FileServer(&statikWrapper{statikFS})
}

func (r *Router) initWS(opts *websocket.Options) {
	r.Router.GET("/ws", websocket.UpstreamHandler(opts.Addr))
}
