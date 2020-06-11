package controller

import (
	"net/http"
	"strconv"

	"github.com/jkuri/abstruse/internal/pkg/auth"
	"github.com/jkuri/abstruse/internal/server/db/model"
	"github.com/jkuri/abstruse/internal/server/service"
	jsoniter "github.com/json-iterator/go"
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

type triggerForm struct {
	ID string `json:"id"`
}

// TriggerBuild triggers build for repository
func (c *BuildController) TriggerBuild(resp http.ResponseWriter, req *http.Request, params httprouter.Params) {
	token := req.Header.Get("Authorization")
	userID, err := auth.GetUserIDFromJWT(token)
	if err != nil {
		JSONResponse(resp, http.StatusUnauthorized, ErrorResponse{Data: err.Error()})
		return
	}
	var form triggerForm
	decoder := jsoniter.NewDecoder(req.Body)
	if err := decoder.Decode(&form); err != nil {
		JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{Data: err.Error()})
		return
	}
	defer req.Body.Close()
	repoID, err := strconv.Atoi(form.ID)
	if err != nil {
		JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{Data: err.Error()})
		return
	}
	JSONResponse(resp, http.StatusOK, Response{Data: c.service.TriggerBuild(uint(repoID), uint(userID))})
}

// StopBuild stops the build and related jobs => POST /api/builds/stop
func (c *BuildController) StopBuild(resp http.ResponseWriter, req *http.Request, params httprouter.Params) {
	type stopBuildForm struct {
		BuildID uint `json:"build_id"`
	}
	var form stopBuildForm
	if err := jsoniter.NewDecoder(req.Body).Decode(&form); err != nil {
		JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{Data: err.Error()})
		return
	}
	defer req.Body.Close()
	JSONResponse(resp, http.StatusOK, BoolResponse{c.service.StopBuild(uint(form.BuildID))})
}

// RestartBuild restarts build => POST /api/builds/restart
func (c *BuildController) RestartBuild(resp http.ResponseWriter, req *http.Request, params httprouter.Params) {
	type restartBuildForm struct {
		BuildID uint `json:"build_id"`
	}
	var form restartBuildForm
	if err := jsoniter.NewDecoder(req.Body).Decode(&form); err != nil {
		JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{Data: err.Error()})
		return
	}
	defer req.Body.Close()
	JSONResponse(resp, http.StatusOK, BoolResponse{c.service.RestartBuild(uint(form.BuildID))})
}

// StopJob stops the job or unqueue if in queue => POST /api/builds/job/stop
func (c *BuildController) StopJob(resp http.ResponseWriter, req *http.Request, params httprouter.Params) {
	type stopJobForm struct {
		JobID uint `json:"job_id"`
	}
	var form stopJobForm
	if err := jsoniter.NewDecoder(req.Body).Decode(&form); err != nil {
		JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{Data: err.Error()})
		return
	}
	defer req.Body.Close()
	JSONResponse(resp, http.StatusOK, BoolResponse{c.service.StopJob(uint(form.JobID))})
}

// RestartJob stops the job or unqueue if in queue => POST /api/builds/job/restart
func (c *BuildController) RestartJob(resp http.ResponseWriter, req *http.Request, params httprouter.Params) {
	type restartJobForm struct {
		JobID uint `json:"job_id"`
	}
	var form restartJobForm
	if err := jsoniter.NewDecoder(req.Body).Decode(&form); err != nil {
		JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{Data: err.Error()})
		return
	}
	defer req.Body.Close()
	JSONResponse(resp, http.StatusOK, BoolResponse{c.service.RestartJob(uint(form.JobID))})
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

// FindBuilds handler => GET /api/builds/all/:limit/:offset
func (c *BuildController) FindBuilds(resp http.ResponseWriter, req *http.Request, params httprouter.Params) {
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
	data, err := c.service.FindBuilds(limit, offset)
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

// FindJob handler => GET /api/builds/jobs/:id
func (c BuildController) FindJob(resp http.ResponseWriter, req *http.Request, params httprouter.Params) {
	jobID, err := strconv.Atoi(params.ByName("id"))
	if err != nil {
		JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{err.Error()})
		return
	}
	data, err := c.service.FindJob(uint(jobID))
	if err != nil {
		JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{err.Error()})
		return
	}
	type jobResponse struct {
		model.Job
		Log string `json:"log"`
	}
	job := &jobResponse{}
	job.ID = data.ID
	job.Commands = data.Commands
	job.Image = data.Image
	job.Env = data.Env
	job.StartTime = data.StartTime
	job.EndTime = data.EndTime
	job.Status = data.Status
	job.Log = data.Log
	job.BuildID = data.BuildID
	job.CreatedAt = data.CreatedAt
	job.UpdatedAt = data.UpdatedAt
	job.Build = data.Build

	JSONResponse(resp, http.StatusOK, Response{job})
}
