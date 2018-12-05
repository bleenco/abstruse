package teams

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/bleenco/abstruse/api"
	"github.com/bleenco/abstruse/db"
	"github.com/bleenco/abstruse/security"
	"github.com/julienschmidt/httprouter"
)

// FetchTeamsHandler => GET /api/teams
func FetchTeamsHandler(res http.ResponseWriter, req *http.Request, _ httprouter.Params) {
	token := req.Header.Get("Authorization")
	userID, err := security.GetUserIDFromJWT(token)
	if err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}

	teams, err := db.FindTeams(userID)
	if err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}

	api.JSONResponse(res, http.StatusOK, api.Response{Data: teams})
}

// SaveTeamHandler => POST /api/teams/:id
func SaveTeamHandler(res http.ResponseWriter, req *http.Request, ps httprouter.Params) {
	teamID, _ := strconv.Atoi(ps.ByName("id"))
	token := req.Header.Get("Authorization")
	userID, err := security.GetUserIDFromJWT(token)
	if err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}

	type teamForm struct {
		ID          int    `json:"id"`
		Title       string `json:"title"`
		Description string `json:"description"`
		Color       string `json:"color"`
	}

	var form teamForm
	decoder := json.NewDecoder(req.Body)
	if err := decoder.Decode(&form); err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}
	defer req.Body.Close()

	if form.ID != teamID {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: "team id mismatch"})
		return
	}

	team := &db.Team{Title: form.Title, Description: form.Description, Color: form.Color}
	team.ID = uint(teamID)
	if err := team.Update(userID); err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}

	api.JSONResponse(res, http.StatusOK, api.BoolResponse{Data: true})
}
