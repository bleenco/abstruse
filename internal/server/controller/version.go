package controller

import (
	"net/http"

	"github.com/jkuri/abstruse/internal/server/service"
	"github.com/julienschmidt/httprouter"
	"go.uber.org/zap"
)

type VersionController struct {
	logger  *zap.SugaredLogger
	service service.VersionService
}

func NewVersionController(logger *zap.Logger, service service.VersionService) *VersionController {
	return &VersionController{logger.Sugar(), service}
}

func (c *VersionController) GetInfo(
	resp http.ResponseWriter,
	req *http.Request,
	_ httprouter.Params,
) {
	JSONResponse(resp, http.StatusOK, Response{Data: c.service.GetInfo()})
}
