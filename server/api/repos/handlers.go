package repos

import (
	"net/http"
	"strconv"

	"github.com/bleenco/abstruse/pkg/security"
	"github.com/bleenco/abstruse/server/api"
	"github.com/bleenco/abstruse/server/db"
	"github.com/julienschmidt/httprouter"
)

// FetchRepositoriesHandler => /api/repositories
func FetchRepositoriesHandler(res http.ResponseWriter, req *http.Request, ps httprouter.Params) {
	token := req.Header.Get("Authorization")
	userID, err := security.GetUserIDFromJWT(token)
	if err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}

	repos, err := db.FindRepositories(userID)
	if err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}

	// hooks, _ := github.ListHooks(1, userID, 1)
	// fmt.Printf("%+v\n", hooks)

	api.JSONResponse(res, http.StatusOK, api.Response{Data: repos})
}

// FetchRepositoryHandler => /api/repositories/:id
func FetchRepositoryHandler(res http.ResponseWriter, req *http.Request, ps httprouter.Params) {
	id, _ := strconv.Atoi(ps.ByName("id"))
	// token := req.Header.Get("Authorization")
	// userID, err := security.GetUserIDFromJWT(token)
	// if err != nil {
	// 	api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
	// 	return
	// }

	var repo db.Repository
	if err := repo.Find(id); err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}

	api.JSONResponse(res, http.StatusOK, api.Response{Data: repo})
}
