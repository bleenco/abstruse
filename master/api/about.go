package api

import (
	"net/http"

	"github.com/jkuri/abstruse/pkg/version"
	"github.com/julienschmidt/httprouter"
)

// FindVersionHandler => /api/version
func FindVersionHandler(res http.ResponseWriter, req *http.Request, ps httprouter.Params) {
	buildInfo := version.GetBuildInfo()
	JSONResponse(res, http.StatusOK, Response{Data: buildInfo})
}
