package builds

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/bleenco/abstruse/server/api"
	"github.com/bleenco/abstruse/server/core"
	"github.com/bleenco/abstruse/server/db"
	"github.com/julienschmidt/httprouter"
)

// TriggerBuildHandler triggers test build for repository. => /api/builds/trigger
func TriggerBuildHandler(res http.ResponseWriter, req *http.Request, ps httprouter.Params) {
	var form struct {
		ID int `json:"id"`
	}
	if err := json.NewDecoder(req.Body).Decode(&form); err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}

	var repo db.Repository
	if err := repo.Find(form.ID); err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}

	// if err := core.StartBuild(int(repo.ID), 3, "", "", "", ""); err != nil {
	// 	api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
	// 	return
	// }

	if err := core.StartBuild(1, 0, "abstruse-config-test", "", "3a1a22865810755508147331a08eb3af83946630", "chore(): update abstruse.yml configuration"); err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}

	// PR test
	// if err := core.StartBuild(11, 2, "master", "test pull request case for abstruse ci", "3a0cb5c3ad82caf3bb935032e85919dec273bdc8", "build(abstruse): abstruse test commit"); err != nil {
	// 	api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
	// 	return
	// }

	api.JSONResponse(res, http.StatusOK, api.BoolResponse{Data: true})
}

// FindBuildsByRepoHandler => /api/builds/repo/:id/:limit/:offset
func FindBuildsByRepoHandler(res http.ResponseWriter, req *http.Request, ps httprouter.Params) {
	id, _ := strconv.Atoi(ps.ByName("id"))
	limit, _ := strconv.Atoi(ps.ByName("limit"))
	offset, _ := strconv.Atoi(ps.ByName("offset"))

	builds, err := db.FindBuildsByRepoID(id, limit, offset)
	if err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}

	for _, build := range builds {
		for _, job := range build.Jobs {
			job.Log = ""
		}
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

	for _, job := range build.Jobs {
		job.Log = ""
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

	if proc, err := core.MainScheduler.FindJobProcessByJobID(int(job.ID)); err == nil {
		job.Log = strings.Join(proc.Log, "")
	}

	api.JSONResponse(res, http.StatusOK, api.Response{Data: job})
}
