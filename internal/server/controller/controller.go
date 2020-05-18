package controller

import (
	"github.com/google/wire"
	"github.com/jkuri/abstruse/internal/pkg/http"
)

func CreateInitControllersFn(
	uc *UserController,
) http.InitControllers {
	return func(r *http.Router) {
		r.POST("/api/user/login", uc.Login)
		r.GET("/api/user/:id", uc.Find)
	}
}

var ProviderSet = wire.NewSet(NewUserController, CreateInitControllersFn)
