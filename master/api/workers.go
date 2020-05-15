package api

import (
	"net/http"
	"path"

	"github.com/jkuri/abstruse/master/rpc"
	"github.com/julienschmidt/httprouter"
)

type workerData struct {
	Addr  string       `json:"addr"`
	Host  rpc.HostInfo `json:"host"`
	Usage []rpc.Usage  `json:"usage"`
}

// GetWorkersHandler => /api/workers
func GetWorkersHandler(res http.ResponseWriter, req *http.Request, _ httprouter.Params) {
	var data []workerData
	workers := rpc.RPCApp.GetWorkers()
	for addr, worker := range workers {
		data = append(data, workerData{path.Base(addr), worker.GetHost(), worker.GetUsage()})
	}

	JSONResponse(res, http.StatusOK, Response{Data: data})
}
