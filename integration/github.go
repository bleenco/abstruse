package integration

import (
	"encoding/json"
	"net/http"

	"github.com/bleenco/abstruse/api"
	"github.com/bleenco/abstruse/providers/github"
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
	var form githubCheckForm
	decoder := json.NewDecoder(req.Body)
	if err := decoder.Decode(&form); err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}
	defer req.Body.Close()

	valid, err := github.CheckAccessTokenValidity(form.URL, form.AccessToken, form.Username, form.Password)
	if err != nil || !valid {
		api.JSONResponse(res, http.StatusOK, api.BoolResponse{Data: false})
		return
	}

	api.JSONResponse(res, http.StatusOK, api.BoolResponse{Data: true})
}
