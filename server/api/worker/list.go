package worker

import (
	"net/http"

	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/core"
)

// HandleList returns an http.HandlerFunc that writes JSON encoded
// list of workers in registry to http response body.
func HandleList(workers core.WorkerRegistry) http.HandlerFunc {
	type resp struct {
		ID    string             `json:"id"`
		Addr  string             `json:"addr"`
		Host  core.HostInfo      `json:"host"`
		Usage []core.WorkerUsage `json:"usage"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		workers, err := workers.List()
		if err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		var response []resp
		for _, worker := range workers {
			response = append(response, resp{worker.ID, worker.Addr, worker.Host, worker.Usage})
		}

		render.JSON(w, http.StatusOK, response)
	}
}
