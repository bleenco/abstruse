package workers

import (
	"net/http"

	"github.com/bleenco/abstruse/api"
	"github.com/bleenco/abstruse/db"
	"github.com/julienschmidt/httprouter"
)

// FindAllHandler => /api/workers
func FindAllHandler(res http.ResponseWriter, req *http.Request, ps httprouter.Params) {
	workers, err := db.FindAllWorkers()
	if err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}

	// hooks, _ := github.ListHooks(1, userID, 1)
	// fmt.Printf("%+v\n", hooks)

	api.JSONResponse(res, http.StatusOK, api.Response{Data: workers})
}
