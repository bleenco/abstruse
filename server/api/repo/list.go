package repo

import (
	"net/http"
	"strconv"

	"github.com/bleenco/abstruse/server/api/middlewares"
	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/core"
)

// HandleList returns an http.HandlerFunc that writes JSON encoded
// list of repositories based on user id to the http response body.
func HandleList(repos core.RepositoryStore) http.HandlerFunc {
	type resp struct {
		Count int               `json:"count"`
		Data  []core.Repository `json:"data"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		claims := middlewares.ClaimsFromCtx(r.Context())
		limit, err := strconv.Atoi(r.URL.Query().Get("limit"))
		if err != nil {
			limit = 1
		}
		offset, err := strconv.Atoi(r.URL.Query().Get("offset"))
		if err != nil {
			offset = 10
		}
		keyword := r.URL.Query().Get("keyword")

		filters := core.RepositoryFilter{
			Limit:   limit,
			Offset:  offset,
			Keyword: keyword,
			UserID:  claims.ID,
		}

		repositories, count, err := repos.List(filters)
		if err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		render.JSON(w, http.StatusOK, resp{Count: count, Data: repositories})
	}
}
