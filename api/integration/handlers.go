package integration

import (
	"net/http"

	"github.com/bleenco/abstruse/api"
	"github.com/bleenco/abstruse/db"
	"github.com/bleenco/abstruse/security"
	"github.com/julienschmidt/httprouter"
)

// FindIntegrationsHandler => /api/integration/:userID
func FindIntegrationsHandler(res http.ResponseWriter, req *http.Request, ps httprouter.Params) {
	token := req.Header.Get("Authorization")
	userID, err := security.GetUserIDFromJWT(token)
	if err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}

	integrations, err := db.FindIntegrationsByUserID(userID)
	if err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}

	api.JSONResponse(res, http.StatusOK, api.Response{Data: integrations})
}
