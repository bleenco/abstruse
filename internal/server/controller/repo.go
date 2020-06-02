package controller

import (
	"net/http"
	"strconv"

	"github.com/jkuri/abstruse/internal/pkg/auth"
	"github.com/jkuri/abstruse/internal/server/service"
	"github.com/julienschmidt/httprouter"
)

// RepositoryController struct
type RepositoryController struct {
	s service.RepositoryService
}

// NewRepositoryController returns new instance of RepositoryController.
func NewRepositoryController(s service.RepositoryService) *RepositoryController {
	return &RepositoryController{s}
}

// List handler => GET /api/repos
func (c *RepositoryController) List(resp http.ResponseWriter, req *http.Request, params httprouter.Params) {
	token := req.Header.Get("Authorization")
	userID, err := auth.GetUserIDFromJWT(token)
	if err != nil {
		JSONResponse(resp, http.StatusUnauthorized, ErrorResponse{Data: err.Error()})
		return
	}
	data, err := c.s.List(uint(userID))
	if err != nil {
		JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{Data: err.Error()})
		return
	}
	JSONResponse(resp, http.StatusOK, Response{Data: data})
}

// Find handler => GET /api/repos/:id
func (c *RepositoryController) Find(resp http.ResponseWriter, req *http.Request, params httprouter.Params) {
	token := req.Header.Get("Authorization")
	userID, err := auth.GetUserIDFromJWT(token)
	if err != nil {
		JSONResponse(resp, http.StatusUnauthorized, ErrorResponse{Data: err.Error()})
		return
	}
	repoID, err := strconv.Atoi(params.ByName("id"))
	if err != nil {
		JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{Data: err.Error()})
		return
	}
	data, err := c.s.Find(uint(repoID), uint(userID))
	if err != nil {
		JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{Data: err.Error()})
		return
	}
	JSONResponse(resp, http.StatusOK, Response{Data: data})
}
