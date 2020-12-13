package worker

import (
	"context"
	"net"
	"net/http"

	"github.com/bleenco/abstruse/server/api/middlewares"
	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/config"
	"github.com/bleenco/abstruse/server/core"
	"github.com/bleenco/abstruse/server/ws"
)

// HandleAuth returns an http.HandlerFunc that writes JSON encoded
// result of worker node authorization to http response body.
func HandleAuth(workers core.WorkerRegistry, config *config.Config, ws *ws.App) http.HandlerFunc {
	type resp struct {
		Auth string `json:"auth"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		claims := middlewares.WorkerClaimsFromCtx(r.Context())
		host, port, err := net.SplitHostPort(claims.Addr)
		if err != nil {
			render.InternalServerError(w, err.Error())
			return
		}
		host, _, err = net.SplitHostPort(r.RemoteAddr)
		if err != nil {
			host = r.RemoteAddr
		}
		addr := net.JoinHostPort(host, port)

		worker, err := core.NewWorker(claims.ID, addr, config, workers, ws)
		if err != nil {
			render.UnathorizedError(w, err.Error())
			return
		}

		if err := worker.Connect(context.Background()); err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		if err := workers.Add(worker); err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		render.JSON(w, http.StatusOK, resp{Auth: host + " " + port})
	}
}
