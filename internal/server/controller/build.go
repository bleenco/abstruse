package controller

import (
	"net/http"

	"github.com/jkuri/abstruse/internal/server/service"
	"github.com/julienschmidt/httprouter"
	"go.uber.org/zap"
)

type BuildController struct {
	logger  *zap.SugaredLogger
	service service.BuildService
}

func NewBuildController(logger *zap.Logger, s service.BuildService) *BuildController {
	return &BuildController{logger.Sugar(), s}
}

func (c *BuildController) StartJob(
	resp http.ResponseWriter,
	req *http.Request,
	_ httprouter.Params,
) {
	JSONResponse(resp, http.StatusOK, Response{Data: c.service.StartJob()})
}
