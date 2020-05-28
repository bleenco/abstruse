package controller

import (
	"net/http"

	"github.com/jkuri/abstruse/internal/pkg/auth"
	"github.com/jkuri/abstruse/internal/server/db/repository"
	"github.com/jkuri/abstruse/internal/server/service"
	jsoniter "github.com/json-iterator/go"
	"github.com/julienschmidt/httprouter"
	"go.uber.org/zap"
)

// IntegrationController struct
type IntegrationController struct {
	logger *zap.SugaredLogger
	s      service.IntegrationService
}

// NewIntegrationController func
func NewIntegrationController(
	logger *zap.Logger, s service.IntegrationService,
) *IntegrationController {
	return &IntegrationController{logger.Sugar(), s}
}

// Find method
func (c *IntegrationController) Find(
	resp http.ResponseWriter, req *http.Request, params httprouter.Params,
) {
	token := req.Header.Get("Authorization")
	userID, err := auth.GetUserIDFromJWT(token)
	if err != nil {
		JSONResponse(resp, http.StatusUnauthorized, ErrorResponse{Data: err.Error()})
		return
	}
	data, err := c.s.Find(uint(userID))
	if err != nil {
		JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{Data: err.Error()})
		return
	}
	JSONResponse(resp, http.StatusOK, Response{Data: data})
}

// New method
func (c *IntegrationController) New(
	resp http.ResponseWriter, req *http.Request, params httprouter.Params,
) {
	token := req.Header.Get("Authorization")
	userID, err := auth.GetUserIDFromJWT(token)
	if err != nil {
		JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{Data: err.Error()})
		return
	}
	var form repository.IntegrationData
	decoder := jsoniter.NewDecoder(req.Body)
	if err := decoder.Decode(&form); err != nil {
		JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{Data: err.Error()})
		return
	}
	defer req.Body.Close()
	form.UserID = uint(userID)
	if _, err := c.s.Create(form); err != nil {
		JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{Data: err.Error()})
		return
	}
	JSONResponse(resp, http.StatusOK, BoolResponse{Data: true})
}
