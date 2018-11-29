package integration

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/bleenco/abstruse/api"
	"github.com/bleenco/abstruse/db"
	"github.com/bleenco/abstruse/security"
	"github.com/julienschmidt/httprouter"
)

type integrationType struct {
	ID        uint      `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Provider string `json:"provider"`

	GithubURL  string         `json:"github_url"`
	GithubData githubDataType `json:"github_data"`
}

type githubDataType struct {
	Login             string    `json:"string"`
	ID                int       `json:"id"`
	NodeID            string    `json:"node_id"`
	AvatarURL         string    `json:"avatar_url"`
	HTMLURL           string    `json:"html_url"`
	Name              string    `json:"name"`
	Company           string    `json:"company"`
	Blog              string    `json:"blog"`
	Location          string    `json:"location"`
	Email             string    `json:"email"`
	Bio               string    `json:"bio"`
	PublicRepos       int       `json:"public_repos"`
	PublicGists       int       `json:"public_gists"`
	TotalPrivateRepos int       `json:"total_private_repos"`
	Followers         int       `json:"followers"`
	Following         int       `json:"following"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

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

	var resp []integrationType

	for _, i := range integrations {
		in := integrationType{
			ID:        i.ID,
			CreatedAt: i.CreatedAt,
			UpdatedAt: i.UpdatedAt,
			Provider:  i.Provider,
		}
		switch i.Provider {
		case "github":
			in.GithubURL = i.GithubURL
			var data githubDataType
			if err := json.Unmarshal([]byte(i.Data), &data); err != nil {
				continue
			}
			in.GithubData = data
		}
		resp = append(resp, in)
	}

	api.JSONResponse(res, http.StatusOK, api.Response{Data: resp})
}
