package integration

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/bleenco/abstruse/pkg/security"
	"github.com/bleenco/abstruse/server/api"
	"github.com/bleenco/abstruse/server/api/providers/github"
	"github.com/julienschmidt/httprouter"
)

type githubCheckForm struct {
	URL         string `json:"url"`
	AccessToken string `json:"access_token"`
	Username    string `json:"username"`
	Password    string `json:"password"`
}

// AddGitHubIntegration => /api/integration/github/add
func AddGitHubIntegration(res http.ResponseWriter, req *http.Request, _ httprouter.Params) {
	token := req.Header.Get("Authorization")
	var form githubCheckForm
	decoder := json.NewDecoder(req.Body)
	if err := decoder.Decode(&form); err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}
	defer req.Body.Close()

	userID, err := security.GetUserIDFromJWT(token)
	if err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}

	valid, err := github.CheckAndAddIntegration(form.URL, form.AccessToken, form.Username, form.Password, userID)
	if err != nil || !valid {
		api.JSONResponse(res, http.StatusOK, api.BoolResponse{Data: false})
		return
	}

	api.JSONResponse(res, http.StatusOK, api.BoolResponse{Data: true})
}

// UpdateGitHubIntegration => /api/integrations/:id/update
func UpdateGitHubIntegration(res http.ResponseWriter, req *http.Request, ps httprouter.Params) {
	integrationID, _ := strconv.Atoi(ps.ByName("id"))
	token := req.Header.Get("Authorization")
	userID, err := security.GetUserIDFromJWT(token)
	if err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}

	ok, err := github.CheckAndUpdateIntegration(integrationID, userID)
	if ok && err == nil {
		api.JSONResponse(res, http.StatusOK, api.BoolResponse{Data: true})
		return
	}

	api.JSONResponse(res, http.StatusOK, api.BoolResponse{Data: false})
}
