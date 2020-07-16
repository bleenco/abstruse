package api

import (
	"net/http"

	"github.com/bleenco/abstruse/pkg/render"
	"github.com/bleenco/abstruse/server/core"
	"github.com/bleenco/abstruse/server/service"
)

type workers struct {
	workerService service.WorkerService
}

func newWorkers(app *core.App) workers {
	return workers{
		workerService: service.NewWorkerService(app),
	}
}

func (wr *workers) find() http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		render.JSON(w, http.StatusOK, wr.workerService.Find())
	})
}
