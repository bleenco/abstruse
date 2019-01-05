package github

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/bleenco/abstruse/pkg/security"
	"github.com/bleenco/abstruse/server/api"
	"github.com/bleenco/abstruse/server/config"
	"github.com/bleenco/abstruse/server/db"
	"github.com/google/go-github/github"
	"github.com/julienschmidt/httprouter"
)

type webhookForm struct {
	URL         string `json:"url"`
	Push        bool   `json:"event_push"`
	PullRequest bool   `json:"event_pr"`
}

// ListHooksHandler => /api/repositories/:id/hooks (GET)
func ListHooksHandler(res http.ResponseWriter, req *http.Request, ps httprouter.Params) {
	repositoryID, _ := strconv.Atoi(ps.ByName("id"))
	token := req.Header.Get("Authorization")

	userID, err := security.GetUserIDFromJWT(token)
	if err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}

	hooks, err := listHooks(repositoryID, userID)
	if err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}

	api.JSONResponse(res, http.StatusOK, api.Response{Data: hooks})
}

// CreateHookHandler => /api/repositories/:id/hooks (POST)
func CreateHookHandler(res http.ResponseWriter, req *http.Request, ps httprouter.Params) {
	repositoryID, _ := strconv.Atoi(ps.ByName("id"))
	token := req.Header.Get("Authorization")

	userID, err := security.GetUserIDFromJWT(token)
	if err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}

	var form webhookForm
	decoder := json.NewDecoder(req.Body)
	if err := decoder.Decode(&form); err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}
	defer req.Body.Close()

	var events []string
	if form.Push {
		events = append(events, "push")
	}
	if form.PullRequest {
		events = append(events, "pull_request")
	}

	cfg := make(map[string]interface{})
	cfg["url"] = form.URL
	cfg["content_type"] = "json"
	cfg["secret"] = config.Configuration.Security.Secret

	hook := &github.Hook{
		Config: cfg,
		Events: events,
		Active: func(b bool) *bool { return &b }(true),
	}

	h, err := createHook(repositoryID, userID, hook)
	if err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}

	api.JSONResponse(res, http.StatusOK, api.Response{Data: h})
}

// listHooks returns list of webhooks entered for repository.
func listHooks(repositoryID, userID int) ([]*github.Hook, error) {
	var repository db.Repository
	if err := repository.Find(repositoryID); err != nil {
		return nil, err
	}

	url, accessToken, username, password, err := getIntegrationClientData(int(repository.IntegrationID), userID)
	if err != nil {
		return nil, err
	}

	client, err := getGitHubClient(url, accessToken, username, password)
	if err != nil {
		return nil, err
	}

	splitted := strings.Split(repository.FullName, "/")
	owner, repo := splitted[0], splitted[1]

	hooks, _, err := client.Repositories.ListHooks(context.Background(), owner, repo, nil)

	return hooks, err
}

func createHook(repositoryID, userID int, hook *github.Hook) (*github.Hook, error) {
	var repository db.Repository
	if err := repository.Find(repositoryID); err != nil {
		return nil, err
	}

	url, accessToken, username, password, err := getIntegrationClientData(int(repository.IntegrationID), userID)
	if err != nil {
		return nil, err
	}

	client, err := getGitHubClient(url, accessToken, username, password)
	if err != nil {
		return nil, err
	}

	splitted := strings.Split(repository.FullName, "/")
	owner, repo := splitted[0], splitted[1]

	h, _, err := client.Repositories.CreateHook(context.Background(), owner, repo, hook)

	return h, err
}
