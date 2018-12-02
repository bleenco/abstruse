package server

import (
	"net/http"

	"github.com/bleenco/abstruse/api"
	"github.com/bleenco/abstruse/api/parser"
	"github.com/julienschmidt/httprouter"
)

// TriggerBuildHandler triggers test build for repository.
func TriggerBuildHandler(res http.ResponseWriter, req *http.Request, ps httprouter.Params) {
	configParser := &parser.ConfigParser{}
	if err := configParser.Parse(); err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}

	if err := MainScheduler.SendJobTask(configParser.Parsed.Image, configParser.Commands); err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}

	api.JSONResponse(res, http.StatusOK, api.BoolResponse{Data: true})
}
