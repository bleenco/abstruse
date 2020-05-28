package controller

import (
	"net/http"

	"github.com/jkuri/abstruse/internal/server/service"
	"github.com/julienschmidt/httprouter"
	"go.uber.org/zap"
)

// MiddlewareController struct
type MiddlewareController struct {
	logger      *zap.SugaredLogger
	userService service.UserService
}

// NewMiddlewareController func
func NewMiddlewareController(logger *zap.Logger, userService service.UserService) *MiddlewareController {
	return &MiddlewareController{logger.Sugar(), userService}
}

// AuthorizationMiddleware is authentication middleware.
func (c *MiddlewareController) AuthorizationMiddleware(fn func(res http.ResponseWriter, req *http.Request, params httprouter.Params)) httprouter.Handle {
	return func(res http.ResponseWriter, req *http.Request, params httprouter.Params) {
		token := req.Header.Get("Authorization")
		if token == "" {
			JSONResponse(res, http.StatusUnauthorized, BoolResponse{Data: false})
			return
		}

		if ok := c.userService.CheckUserJWT(token); !ok {
			JSONResponse(res, http.StatusUnauthorized, BoolResponse{Data: false})
			return
		}

		fn(res, req, params)
	}
}
