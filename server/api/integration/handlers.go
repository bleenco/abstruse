package integration

import (
	"net/http"
	"strconv"
	"time"

	"github.com/bleenco/abstruse/pkg/security"
	"github.com/bleenco/abstruse/server/api"
	"github.com/bleenco/abstruse/server/api/providers/github"
	"github.com/bleenco/abstruse/server/db"
	"github.com/julienschmidt/httprouter"
)

type integrationType struct {
	ID        uint      `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Provider  string    `json:"provider"`
	URL       string    `json:"url"`
}

// FindIntegrationsHandler => /api/integrations
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

	var resp []integrationType

	for _, i := range integrations {
		in := integrationType{
			ID:        i.ID,
			CreatedAt: i.CreatedAt,
			UpdatedAt: i.UpdatedAt,
			Provider:  i.Provider,
		}
		resp = append(resp, in)
	}

	api.JSONResponse(res, http.StatusOK, api.Response{Data: resp})
}

// FindIntegrationHandler => /api/integrations/:id
func FindIntegrationHandler(res http.ResponseWriter, req *http.Request, ps httprouter.Params) {
	integrationID, _ := strconv.Atoi(ps.ByName("id"))
	token := req.Header.Get("Authorization")
	userID, err := security.GetUserIDFromJWT(token)
	if err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}

	integration := db.Integration{}
	integration, err = integration.Find(integrationID, userID)
	if err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}

	resp := integrationType{
		ID:        integration.ID,
		CreatedAt: integration.CreatedAt,
		UpdatedAt: integration.UpdatedAt,
		Provider:  integration.Provider,
	}

	api.JSONResponse(res, http.StatusOK, api.Response{Data: resp})
}

// FetchIntegrationRepositoriesHandler => /api/integrations/:id/repos
func FetchIntegrationRepositoriesHandler(res http.ResponseWriter, req *http.Request, ps httprouter.Params) {
	integrationID, _ := strconv.Atoi(ps.ByName("id"))
	token := req.Header.Get("Authorization")
	userID, err := security.GetUserIDFromJWT(token)
	if err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}

	integration := db.Integration{}
	integration, err = integration.Find(integrationID, userID)
	if err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}

	switch integration.Provider {
	case "github":
		resp, err := github.FetchIntegrationRepositories(integration.APIURL, integration.AccessToken, integration.Username, integration.Password)
		if err != nil {
			api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
			return
		}

		api.JSONResponse(res, http.StatusOK, api.Response{Data: resp})
	}
}
