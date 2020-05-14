package api

import (
	"encoding/json"
	"net/http"

	"github.com/jkuri/abstruse/master/db"
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
		JSONResponse(res, http.StatusInternalServerError, ErrorResponse{Data: err.Error()})
		return
	}
	defer req.Body.Close()

	user := &db.User{}
	if _, err := user.FindByEmail(form.Email); err != nil {
		JSONResponse(res, http.StatusInternalServerError, ErrorResponse{Data: err.Error()})
		return
	}

	if user.CheckPassword(form.Password) {
		jsonwebtoken, err := user.GenerateJWT()
		if err != nil {
			JSONResponse(res, http.StatusInternalServerError, ErrorResponse{Data: err.Error()})
			return
		}
		JSONResponse(res, http.StatusOK, DataResponse{Data: jsonwebtoken})
	} else {
		JSONResponse(res, http.StatusOK, BoolResponse{Data: false})
		return
	}
}
