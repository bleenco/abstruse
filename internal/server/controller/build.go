package controller

import (
	"net/http"
	"strconv"

	"github.com/jkuri/abstruse/internal/server/service"
	"github.com/julienschmidt/httprouter"
)

// BuildController struct
type BuildController struct {
	service service.BuildService
}

// NewBuildController returns new BuildController
func NewBuildController(service service.BuildService) *BuildController {
	return &BuildController{service}
}

// StartJob temporary function to test builds.
func (c *BuildController) StartJob(resp http.ResponseWriter, req *http.Request, _ httprouter.Params) {
	JSONResponse(resp, http.StatusOK, Response{Data: c.service.StartJob()})
}

// Find handler => GET /api/builds/:id
func (c *BuildController) Find(resp http.ResponseWriter, req *http.Request, params httprouter.Params) {
	buildID, err := strconv.Atoi(params.ByName("id"))
	if err != nil {
		JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{err.Error()})
		return
	}
	data, err := c.service.Find(uint(buildID))
	if err != nil {
		JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{err.Error()})
		return
	}
	JSONResponse(resp, http.StatusOK, Response{data})
}

// FindAll handler => GET /api/builds/:id/all
func (c *BuildController) FindAll(resp http.ResponseWriter, req *http.Request, params httprouter.Params) {
	buildID, err := strconv.Atoi(params.ByName("id"))
	if err != nil {
		JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{err.Error()})
		return
	}
	data, err := c.service.FindAll(uint(buildID))
	if err != nil {
		JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{err.Error()})
		return
	}
	JSONResponse(resp, http.StatusOK, Response{data})
}

// FindByRepoID handler => GET /api/builds/repo/:id/:limit/:offset
func (c BuildController) FindByRepoID(resp http.ResponseWriter, req *http.Request, params httprouter.Params) {
	repoID, err := strconv.Atoi(params.ByName("id"))
	if err != nil {
		JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{err.Error()})
		return
	}
	limit, err := strconv.Atoi(params.ByName("limit"))
	if err != nil {
		JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{err.Error()})
		return
	}
	offset, err := strconv.Atoi(params.ByName("offset"))
	if err != nil {
		JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{err.Error()})
		return
	}
	data, err := c.service.FindByRepoID(uint(repoID), limit, offset)
	if err != nil {
		JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{err.Error()})
		return
	}
	JSONResponse(resp, http.StatusOK, Response{data})
}
