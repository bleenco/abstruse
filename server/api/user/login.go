package user

import (
	"encoding/json"
	"net/http"

	"github.com/bleenco/abstruse/server/api"
	"github.com/bleenco/abstruse/server/db"
	"github.com/julienschmidt/httprouter"
)

type loginForm struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// LoginHandler => /api/user/login
func LoginHandler(res http.ResponseWriter, req *http.Request, _ httprouter.Params) {
	var form loginForm
	decoder := json.NewDecoder(req.Body)
	if err := decoder.Decode(&form); err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}
	defer req.Body.Close()

	user := &db.User{}
	if _, err := user.FindByEmail(form.Email); err != nil {
		api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
		return
	}

	if user.CheckPassword(form.Password) {
		jsonwebtoken, err := user.GenerateJWT()
		if err != nil {
			api.JSONResponse(res, http.StatusInternalServerError, api.ErrorResponse{Data: err.Error()})
			return
		}
		api.JSONResponse(res, http.StatusOK, api.DataResponse{Data: jsonwebtoken})
	} else {
		api.JSONResponse(res, http.StatusOK, api.BoolResponse{Data: false})
		return
	}
}
