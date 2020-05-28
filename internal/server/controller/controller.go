package controller

import (
	"github.com/google/wire"
	"github.com/jkuri/abstruse/internal/pkg/http"
)

// CreateInitControllersFn func
func CreateInitControllersFn(
	uc *UserController,
	vc *VersionController,
	wc *WorkerController,
	bc *BuildController,
	ic *IntegrationController,
	rc *RepositoryController,
	mc *MiddlewareController,
) http.InitControllers {
	return func(r *http.Router) {
		r.POST("/api/user/login", uc.Login)
		r.GET("/api/user/:id", uc.Find)
		r.GET("/api/version", mc.AuthorizationMiddleware(vc.GetInfo))
		r.GET("/api/workers", mc.AuthorizationMiddleware(wc.GetWorkers))
		r.POST("/api/build/start", mc.AuthorizationMiddleware(bc.StartJob))
		r.GET("/api/integrations", mc.AuthorizationMiddleware(ic.Find))

		r.GET("/api/repos", mc.AuthorizationMiddleware(rc.List))
		r.GET("/api/repos/:id", mc.AuthorizationMiddleware(rc.Find))
	}
}

// ProviderSet exports for wire dependency injection.
var ProviderSet = wire.NewSet(
	NewUserController,
	NewVersionController,
	NewWorkerController,
	NewBuildController,
	NewMiddlewareController,
	NewIntegrationController,
	NewRepositoryController,
	CreateInitControllersFn,
)
