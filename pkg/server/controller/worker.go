package controller

import (
	"net/http"

	"github.com/jkuri/abstruse/pkg/server/service"
	"github.com/julienschmidt/httprouter"
	"go.uber.org/zap"
)

// WorkerController struct
type WorkerController struct {
	logger  *zap.SugaredLogger
	service service.WorkerService
}

// NewWorkerController returns new instance of WorkerController.
func NewWorkerController(logger *zap.Logger, service service.WorkerService) *WorkerController {
	return &WorkerController{logger.Sugar(), service}
}

// GetWorkers handler.
func (c *WorkerController) GetWorkers(
	resp http.ResponseWriter,
	req *http.Request,
	_ httprouter.Params,
) {
	JSONResponse(resp, http.StatusOK, Response{Data: c.service.GetWorkers()})
}
