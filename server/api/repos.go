package api

import (
	"net/http"

	"github.com/bleenco/abstruse/pkg/render"
	"github.com/bleenco/abstruse/server/db/repository"
	"go.uber.org/zap"
)

type repos struct {
	logger         *zap.SugaredLogger
	repoRepository repository.RepoRepository
}

func newRepos(logger *zap.Logger) repos {
	return repos{
		logger:         logger.With(zap.String("api", "repos")).Sugar(),
		repoRepository: repository.NewRepoRepository(),
	}
}

func (r *repos) find() http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		claims := claimsFromCtx(req.Context())

		repositories, err := r.repoRepository.Find(claims.ID)
		if err != nil {
			render.JSON(w, http.StatusNotFound, render.Error{Message: err.Error()})
			return
		}

		render.JSON(w, http.StatusOK, repositories)
	})
}

func (r *repos) create() http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {

	})
}
