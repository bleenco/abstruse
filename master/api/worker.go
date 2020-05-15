package api

import (
	"encoding/json"
	"net/http"

	"github.com/jkuri/abstruse/master/rpc"
	"github.com/julienschmidt/httprouter"
)

type workersResp struct {
	Addr  string       `json:"addr"`
	Host  rpc.HostInfo `json:"host"`
	Usage []rpc.Usage  `json:"usage"`
}

// GetWorkersHandler => /api/workers
func GetWorkersHandler(res http.ResponseWriter, req *http.Request, _ httprouter.Params) {
	var data []workersResp
	workers := rpc.RPCApp.GetWorkers()
	for addr, worker := range workers {
		data = append(data, workersResp{addr, worker.GetHost(), worker.GetUsage()})
	}
	resp, err := json.Marshal(&data)
	if err != nil {
		JSONResponse(res, http.StatusInternalServerError, ErrorResponse{Data: err.Error()})
		return
	}

	JSONResponse(res, http.StatusOK, DataResponse{Data: string(resp)})
}
