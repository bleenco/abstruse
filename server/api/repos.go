package api

import (
	"net/http"
	"strconv"

	"github.com/asaskevich/govalidator"
	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/pkg/render"
	"github.com/bleenco/abstruse/pkg/scm"
	"github.com/bleenco/abstruse/server/db/model"
	"github.com/bleenco/abstruse/server/db/repository"
	"github.com/bleenco/abstruse/server/service"
	"github.com/go-chi/chi"
	"go.uber.org/zap"
)

type repos struct {
	logger         *zap.SugaredLogger
	repoRepository repository.RepoRepository
	repoService    service.RepoService
}

func newRepos(logger *zap.Logger) repos {
	return repos{
		logger:         logger.With(zap.String("api", "repos")).Sugar(),
		repoRepository: repository.NewRepoRepository(),
		repoService:    service.NewRepoService(),
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
		keyword := req.URL.Query().Get("keyword")

		repositories, count, err := r.repoRepository.Find(claims.ID, limit, offset, keyword)
		if err != nil {
			render.JSON(w, http.StatusNotFound, render.Error{Message: err.Error()})
			return
		}

		render.JSON(w, http.StatusOK, resp{Count: count, Data: repositories})
	})
}

func (r *repos) findByID() http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		claims := claimsFromCtx(req.Context())
		repoID, err := strconv.Atoi(chi.URLParam(req, "id"))
		if err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		repo, err := r.repoRepository.FindByID(uint(repoID), claims.ID)
		if err != nil {
			render.JSON(w, http.StatusNotFound, render.Error{Message: err.Error()})
			return
		}

		render.JSON(w, http.StatusOK, repo)
	})
}

func (r *repos) setActive() http.HandlerFunc {
	type form struct {
		Active bool `json:"active" valid:"required"`
	}

	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		claims := claimsFromCtx(req.Context())
		var f form
		var err error
		defer req.Body.Close()
		repoID, err := strconv.Atoi(chi.URLParam(req, "id"))
		if err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		if err = lib.DecodeJSON(req.Body, &f); err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		if valid, err := govalidator.ValidateStruct(f); err != nil || !valid {
			render.JSON(w, http.StatusBadRequest, render.Error{Message: err.Error()})
			return
		}

		if err = r.repoRepository.SetActive(uint(repoID), claims.ID, f.Active); err != nil {
			render.JSON(w, http.StatusNotFound, render.Error{Message: err.Error()})
			return
		}

		render.JSON(w, http.StatusOK, render.Empty{})
	})
}

func (r *repos) hooks() http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		claims := claimsFromCtx(req.Context())
		repoID, err := strconv.Atoi(chi.URLParam(req, "id"))
		if err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		data, err := r.repoService.ListHooks(uint(repoID), claims.ID)
		if err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		render.JSON(w, http.StatusOK, data)
	})
}

func (r *repos) createHooks() http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		var f scm.HookForm
		claims := claimsFromCtx(req.Context())
		repoID, err := strconv.Atoi(chi.URLParam(req, "id"))
		if err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}
		defer req.Body.Close()

		if err = lib.DecodeJSON(req.Body, &f); err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		if valid, err := govalidator.ValidateStruct(f); err != nil || !valid {
			render.JSON(w, http.StatusBadRequest, render.Error{Message: err.Error()})
			return
		}

		if err := r.repoService.CreateHook(uint(repoID), claims.ID, f); err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		render.JSON(w, http.StatusOK, render.Empty{})
	})
}
