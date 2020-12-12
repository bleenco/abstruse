package repo

import (
	"context"
	"net/http"
	"strconv"

	"github.com/bleenco/abstruse/pkg/gitscm"
	"github.com/bleenco/abstruse/server/api/middlewares"
	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/core"
	"github.com/go-chi/chi"
)

// HandleConfig returns an http.HandlerFunc that writes JSON encoded
// result about repository config to the http response body.
func HandleConfig(repos core.RepositoryStore) http.HandlerFunc {
	type resp struct {
		Content string `json:"content"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		claims := middlewares.ClaimsFromCtx(r.Context())
		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		repo, err := repos.Find(uint(id), claims.ID)
		if err != nil {
			render.NotFoundError(w, err.Error())
			return
		}

		scm, err := gitscm.New(
			context.Background(),
			repo.Provider.Name,
			repo.Provider.URL,
			repo.Provider.AccessToken,
		)
		if err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		commit, err := scm.LastCommit(repo.FullName, repo.DefaultBranch)
		if err != nil {
			render.InternalServerError(w, err.Error())
			return
		}
		content, err := scm.FindContent(repo.FullName, commit.Sha, ".abstruse.yml")
		if err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		render.JSON(w, http.StatusOK, resp{string(content.Data)})
	}
}
