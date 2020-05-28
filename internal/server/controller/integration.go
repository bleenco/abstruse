package controller

import (
	"net/http"

	"github.com/jkuri/abstruse/internal/server/service"
	"github.com/julienschmidt/httprouter"
	"go.uber.org/zap"
)

// IntegrationController struct
type IntegrationController struct {
	logger  *zap.SugaredLogger
	service service.IntegrationService
}

type integrationForm struct {
	Provider    string `json:"provider"`
	URL         string `json:"url"`
	APIURL      string `json:"api_url"`
	Username    string `json:"username"`
	Password    string `json:"password"`
	AccessToken string `json:"access_token"`
}

// NewIntegrationController func
func NewIntegrationController(logger *zap.Logger, s service.IntegrationService) *IntegrationController {
	return &IntegrationController{logger.Sugar(), s}
}

// New method
func (c *IntegrationController) New(
	resp http.ResponseWriter, req *http.Request, params httprouter.Params,
) {

}
