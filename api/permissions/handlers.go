package permissions

import (
	"net/http"
	"strconv"

	"github.com/bleenco/abstruse/api"
	"github.com/bleenco/abstruse/db"
	"github.com/julienschmidt/httprouter"
)

// FetchPermissionsHandler => GET /api/permissions/teams/:teamID?={predefined}
func FetchPermissionsHandler(res http.ResponseWriter, req *http.Request, ps httprouter.Params) {
	teamID, _ := strconv.Atoi(ps.ByName("id"))
	query := req.URL.Query()
	// token := req.Header.Get("Authorization")
	// _, err := security.GetUserIDFromJWT(token)
	// if err != nil {
	// 	api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
	// 	return
	// }

	switch query.Get("type") {
	case "predefined":
		permissions, err := db.FindPredefinedPermissions(teamID)
		if err != nil {
			api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
			return
		}

		api.JSONResponse(res, http.StatusOK, api.Response{Data: permissions})
	default:
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: "unknown type"})
		return
	}
}
