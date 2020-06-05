package controller

import (
	"github.com/jkuri/abstruse/internal/pkg/http"
)

// CreateInitControllersFn func
func CreateInitControllersFn(
	uc *UserController,
	vc *VersionController,
	wc *WorkerController,
	bc *BuildController,
	rc *RepositoryController,
	pc *ProviderController,
	mc *MiddlewareController,
) http.InitControllers {
	return func(r *http.Router) {
		r.POST("/api/user/login", uc.Login)
		r.GET("/api/user/:id", uc.Find)
		r.GET("/api/version", mc.AuthorizationMiddleware(vc.GetInfo))
		r.GET("/api/workers", mc.AuthorizationMiddleware(wc.GetWorkers))

		r.GET("/api/builds/all/:limit/:offset", mc.AuthorizationMiddleware(bc.FindBuilds))
		r.GET("/api/builds/info/:id", mc.AuthorizationMiddleware(bc.Find))
		r.GET("/api/builds/info/:id/all", mc.AuthorizationMiddleware(bc.FindAll))
		r.GET("/api/builds/repo/:id/:limit/:offset", mc.AuthorizationMiddleware(bc.FindByRepoID))
		r.POST("/api/builds/trigger", mc.AuthorizationMiddleware(bc.TriggerBuild))
		r.GET("/api/builds/jobs/:id", mc.AuthorizationMiddleware(bc.FindJob))

		r.GET("/api/providers", mc.AuthorizationMiddleware(pc.List))
		r.PUT("/api/providers", mc.AuthorizationMiddleware(pc.Create))
		r.POST("/api/providers", mc.AuthorizationMiddleware(pc.Update))
		r.GET("/api/providers/:id", mc.AuthorizationMiddleware(pc.Find))
		r.GET("/api/providers/:id/repos/:page/:size", mc.AuthorizationMiddleware(pc.ReposList))
		r.POST("/api/providers/:id/repos", mc.AuthorizationMiddleware(pc.ReposFind))
		r.PUT("/api/providers/:id/repos/import", mc.AuthorizationMiddleware(pc.ReposImport))

		r.GET("/api/repos", mc.AuthorizationMiddleware(rc.List))
		r.GET("/api/repos/:id", mc.AuthorizationMiddleware(rc.Find))
	}
}
