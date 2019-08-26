package builds

import (
	"net/http"
	"strconv"

	"github.com/bleenco/abstruse/server/api"
	"github.com/bleenco/abstruse/server/core"
	"github.com/bleenco/abstruse/server/db"
	"github.com/julienschmidt/httprouter"
)

// TriggerBuildHandler triggers test build for repository.
func TriggerBuildHandler(res http.ResponseWriter, req *http.Request, ps httprouter.Params) {
	// if err := core.StartBuild(11, 0, "abstruse-config-test", "", "3a0cb5c3ad82caf3bb935032e85919dec273bdc8", "build(abstruse): abstruse test commit"); err != nil {
	// 	api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
	// 	return
	// }

	// PR test
	if err := core.StartBuild(11, 2, "master", "test pull request case for abstruse ci", "3a0cb5c3ad82caf3bb935032e85919dec273bdc8", "build(abstruse): abstruse test commit"); err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}

	api.JSONResponse(res, http.StatusOK, api.BoolResponse{Data: true})
}

// FindBuildsByRepoHandler => /api/builds/repo/:id
func FindBuildsByRepoHandler(res http.ResponseWriter, req *http.Request, ps httprouter.Params) {
	id, _ := strconv.Atoi(ps.ByName("id"))

	builds, err := db.FindBuildsByRepoID(id)
	if err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}

	api.JSONResponse(res, http.StatusOK, api.Response{Data: builds})
}

// FindBuildInfoHandler => /api/builds/info/:id
func FindBuildInfoHandler(res http.ResponseWriter, req *http.Request, ps httprouter.Params) {
	id, _ := strconv.Atoi(ps.ByName("id"))

	var build db.Build
	if err := build.FindAll(id); err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}

	api.JSONResponse(res, http.StatusOK, api.Response{Data: build})
}

// FindJobInfoHandler => /api/builds/job/:id
func FindJobInfoHandler(res http.ResponseWriter, req *http.Request, ps httprouter.Params) {
	id, _ := strconv.Atoi(ps.ByName("id"))

	var job db.Job
	if err := job.Find(id); err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}

	api.JSONResponse(res, http.StatusOK, api.Response{Data: job})
}
