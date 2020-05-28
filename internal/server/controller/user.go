package controller

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/jkuri/abstruse/internal/server/service"
	"github.com/julienschmidt/httprouter"
	"go.uber.org/zap"
)

// UserController struct
type UserController struct {
	logger  *zap.SugaredLogger
	service service.UserService
}

// NewUserController returns new instance of UserController.
func NewUserController(logger *zap.Logger, service service.UserService) *UserController {
	return &UserController{logger.Sugar(), service}
}

// Find method
func (c *UserController) Find(resp http.ResponseWriter, req *http.Request, ps httprouter.Params) {
	id, err := strconv.ParseUint(ps.ByName("id"), 10, 64)
	if err != nil {
		JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{Data: err.Error()})
		return
	}
	user, err := c.service.Find(id)
	if err != nil {
		JSONResponse(resp, http.StatusNotFound, ErrorResponse{Data: "user not found"})
		return
	}
	JSONResponse(resp, http.StatusOK, user)
}

// Login method
func (c *UserController) Login(resp http.ResponseWriter, req *http.Request, ps httprouter.Params) {
	var form loginForm
	decoder := json.NewDecoder(req.Body)
	if err := decoder.Decode(&form); err != nil {
		JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{Data: err.Error()})
		return
	}
	defer req.Body.Close()

	user, err := c.service.FindByEmail(form.Email)
	if err != nil {
		JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{Data: err.Error()})
		return
	}

	if c.service.CheckPassword(user, form.Password) {
		jsonwebtoken, err := c.service.GenerateJWT(user)
		if err != nil {
			JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{Data: err.Error()})
			return
		}
		JSONResponse(resp, http.StatusOK, DataResponse{Data: jsonwebtoken})
	} else {
		JSONResponse(resp, http.StatusOK, BoolResponse{Data: false})
		return
	}
}
