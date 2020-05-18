package controller

import (
	"net/http"

	"github.com/jkuri/abstruse/internal/server/service"
	"github.com/julienschmidt/httprouter"
	"go.uber.org/zap"
)

type WorkerController struct {
	logger  *zap.SugaredLogger
	service service.WorkerService
}

func NewWorkerController(logger *zap.Logger, service service.WorkerService) *WorkerController {
	return &WorkerController{logger.Sugar(), service}
}

func (c *WorkerController) GetWorkers(
	resp http.ResponseWriter,
	req *http.Request,
	_ httprouter.Params,
) {
	JSONResponse(resp, http.StatusOK, Response{Data: c.service.GetWorkers()})
}
