package controller

import (
	"net/http"

	"github.com/jkuri/abstruse/internal/server/service"
	"github.com/julienschmidt/httprouter"
	"go.uber.org/zap"
)

// BuildController struct
type BuildController struct {
	logger  *zap.SugaredLogger
	service service.BuildService
}

// NewBuildController returns new BuildController
func NewBuildController(logger *zap.Logger, s service.BuildService) *BuildController {
	return &BuildController{logger.Sugar(), s}
}

// StartJob temporary function to test builds.
func (c *BuildController) StartJob(
	resp http.ResponseWriter,
	req *http.Request,
	_ httprouter.Params,
) {
	JSONResponse(resp, http.StatusOK, Response{Data: c.service.StartJob()})
}
