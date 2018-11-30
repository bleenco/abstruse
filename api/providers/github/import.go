package github

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/bleenco/abstruse/api"
	"github.com/bleenco/abstruse/db"
	"github.com/bleenco/abstruse/security"
	"github.com/google/go-github/github"
	"github.com/julienschmidt/httprouter"
)

// ImportRepositoryHandler => /apis/integrations/:id
func ImportRepositoryHandler(res http.ResponseWriter, req *http.Request, ps httprouter.Params) {
	integrationID, _ := strconv.Atoi(ps.ByName("id"))
	token := req.Header.Get("Authorization")
	var form github.Repository

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

	repo := db.Repository{
		ProviderID:    int(form.GetID()),
		Provider:      "github",
		Name:          form.GetName(),
		FullName:      form.GetFullName(),
		URL:           form.GetURL(),
		HTMLURL:       form.GetHTMLURL(),
		GitURL:        form.GetGitURL(),
		Description:   form.GetDescription(),
		Homepage:      form.GetHomepage(),
		DefaultBranch: form.GetDefaultBranch(),
		MasterBranch:  form.GetMasterBranch(),
		Language:      form.GetLanguage(),
		Fork:          form.GetFork(),
		Size:          form.GetSize(),
		UserID:        uint(userID),
		IntegrationID: uint(integrationID),
	}

	if err := repo.Create(); err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}

	api.JSONResponse(res, http.StatusOK, api.BoolResponse{Data: true})
}
