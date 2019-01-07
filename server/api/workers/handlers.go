package workers

import (
	"net/http"

	"github.com/bleenco/abstruse/server/api"
	"github.com/bleenco/abstruse/server/db"
	"github.com/bleenco/abstruse/server/registry"
	"github.com/julienschmidt/httprouter"
)

// FindAllHandler => /api/workers
func FindAllHandler(res http.ResponseWriter, req *http.Request, ps httprouter.Params) {
	workers, err := db.FindAllWorkers()
	if err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}

	for i, worker := range workers {
		if registryItem, err := registry.Registry.Find(worker.CertID); err == nil {
			worker.Capacity = registryItem.Capacity
			worker.CapacityLoad = registryItem.CapacityUsed
			worker.CPU = registryItem.CPU
			worker.Memory = registryItem.Memory
			workers[i] = worker
		}
	}

	api.JSONResponse(res, http.StatusOK, api.Response{Data: workers})
}
