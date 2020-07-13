package api

import (
	"net/http"
	"strconv"

	"github.com/asaskevich/govalidator"
	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/pkg/render"
	"github.com/bleenco/abstruse/server/db/model"
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
	type resp struct {
		Count int                `json:"count"`
		Data  []model.Repository `json:"data"`
	}

	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		claims := claimsFromCtx(req.Context())
		limit, err := strconv.Atoi(req.URL.Query().Get("limit"))
		if err != nil {
			limit = 1
		}
		offset, err := strconv.Atoi(req.URL.Query().Get("offset"))
		if err != nil {
			offset = 10
		}

		repositories, count, err := r.repoRepository.Find(claims.ID, limit, offset)
		if err != nil {
			render.JSON(w, http.StatusNotFound, render.Error{Message: err.Error()})
			return
		}

		render.JSON(w, http.StatusOK, resp{Count: count, Data: repositories})
	})
}

func (r *repos) setActive() http.HandlerFunc {
	type form struct {
		ID     uint `json:"id" valid:"required"`
		Active bool `json:"active" valid:"required"`
	}

	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		claims := claimsFromCtx(req.Context())
		var f form
		var err error
		defer req.Body.Close()

		if err = lib.DecodeJSON(req.Body, &f); err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		if valid, err := govalidator.ValidateStruct(f); err != nil || !valid {
			render.JSON(w, http.StatusBadRequest, render.Error{Message: err.Error()})
			return
		}

		if err = r.repoRepository.SetActive(f.ID, claims.ID, f.Active); err != nil {
			render.JSON(w, http.StatusNotFound, render.Error{Message: err.Error()})
			return
		}

		render.JSON(w, http.StatusOK, render.Empty{})
	})
}
