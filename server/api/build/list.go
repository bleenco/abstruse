package build

import (
	"net/http"
	"strconv"

	"github.com/bleenco/abstruse/server/api/middlewares"
	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/core"
)

// HandleList returns an http.HandlerFunc that writes JSON encoded
// list of builds to the http response body.
func HandleList(builds core.BuildStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims := middlewares.ClaimsFromCtx(r.Context())
		limit, err := strconv.Atoi(r.URL.Query().Get("limit"))
		if err != nil {
			limit = 5
		}
		offset, err := strconv.Atoi(r.URL.Query().Get("offset"))
		if err != nil {
			offset = 0
		}
		repoID, err := strconv.Atoi(r.URL.Query().Get("repoID"))
		if err != nil {
			repoID = 0
		}
		kind := r.URL.Query().Get("type")
		if kind == "" {
			kind = "latest"
		}

		filters := core.BuildFilter{
			Limit:        limit,
			Offset:       offset,
			RepositoryID: repoID,
			Kind:         kind,
			UserID:       claims.ID,
		}

		builds, err := builds.List(filters)
		if err != nil {
			render.NotFoundError(w, err.Error())
			return
		}

		render.JSON(w, http.StatusOK, builds)
	}
}
