package http

import (
	"github.com/jkuri/abstruse/pkg/server/options"
	_ "github.com/jkuri/abstruse/pkg/server/ui" // web ui
	"github.com/jkuri/abstruse/pkg/server/websocket"
	"github.com/jkuri/statik/fs"
	"github.com/julienschmidt/httprouter"
)

// Router represents main HTTP router.
type Router struct {
	*httprouter.Router
	opts *options.Options
}

// InitControllers func
type InitControllers func(r *Router)

// NewRouter returns new instance of router.
func NewRouter(opts *options.Options, init InitControllers) *Router {
	r := &Router{httprouter.New(), opts}
	init(r)
	r.initUI()
	r.initWS()

	return r
}

func (r *Router) initUI() {
	statikFS, _ := fs.New()
	r.Router.NotFound = fileServer(statikFS)
}

func (r *Router) initWS() {
	r.Router.GET("/ws", websocket.UpstreamHandler(r.opts.Websocket.Addr))
}
