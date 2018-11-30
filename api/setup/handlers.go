package setup

import (
	"net/http"

	"github.com/bleenco/abstruse/api"
	"github.com/julienschmidt/httprouter"
)

// ReadyHandler => GET /api/setup/ready
func ReadyHandler(res http.ResponseWriter, req *http.Request, _ httprouter.Params) {
	api.JSONResponse(res, http.StatusOK, api.BoolResponse{Data: true})
}
