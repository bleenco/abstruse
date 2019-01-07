package workers

import (
	"net/http"

	"github.com/bleenco/abstruse/server/api"
	"github.com/bleenco/abstruse/server/core"
	"github.com/bleenco/abstruse/server/db"
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
		workers[i].Status = "down"
		if registryItem, err := core.Registry.Find(worker.CertID); err == nil {
			workers[i].Status = "operational"
			workers[i].Capacity = registryItem.Capacity
			workers[i].CapacityLoad = registryItem.CapacityUsed
			workers[i].CPU = registryItem.CPU
			workers[i].Memory = registryItem.Memory
		}
	}

	api.JSONResponse(res, http.StatusOK, api.Response{Data: workers})
}
