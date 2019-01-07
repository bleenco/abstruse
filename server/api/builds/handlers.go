package builds

import (
	"net/http"

	"github.com/bleenco/abstruse/server/api"
	"github.com/bleenco/abstruse/server/core"
	"github.com/julienschmidt/httprouter"
)

// TriggerBuildHandler triggers test build for repository.
func TriggerBuildHandler(res http.ResponseWriter, req *http.Request, ps httprouter.Params) {
	if err := core.StartBuild(1, "master", "", "8e1c6452d41d7a45d0b16d5f711befdbbe2c0320"); err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}

	api.JSONResponse(res, http.StatusOK, api.BoolResponse{Data: true})
}
