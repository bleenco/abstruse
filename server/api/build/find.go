package build

import (
	"net/http"
	"strconv"

	"github.com/bleenco/abstruse/server/api/middlewares"
	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/core"
	"github.com/go-chi/chi"
)

// HandleFind returns an http.HandlerFunc that writes JSON encoded
// result of build to the http response.
func HandleFind(builds core.BuildStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims := middlewares.ClaimsFromCtx(r.Context())
		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			render.BadRequestError(w, err.Error())
			return
		}

		build, err := builds.FindUser(uint(id), claims.ID)
		if err != nil {
			render.NotFoundError(w, err.Error())
			return
		}

		render.JSON(w, http.StatusOK, build)
	}
}
