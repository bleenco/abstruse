package api

import (
	"net/http"
	"strconv"

	"github.com/asaskevich/govalidator"
	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/pkg/render"
	"github.com/bleenco/abstruse/server/core"
	"github.com/bleenco/abstruse/server/db/repository"
	"github.com/bleenco/abstruse/server/service"
	"github.com/go-chi/chi"
)

type builds struct {
	buildRepo    repository.BuildRepo
	buildService service.BuildService
}

func newBuilds(app *core.App) builds {
	return builds{
		buildRepo:    repository.NewBuildRepo(),
		buildService: service.NewBuildService(app),
	}
}

func (b *builds) find() http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// TODO: add authentication

		limit, err := strconv.Atoi(r.URL.Query().Get("limit"))
		if err != nil {
			limit = 5
		}
		offset, err := strconv.Atoi(r.URL.Query().Get("offset"))
		if err != nil {
			offset = 0
		}

		builds, err := b.buildRepo.FindBuilds(limit, offset)
		if err != nil {
			render.JSON(w, http.StatusNotFound, render.Error{Message: err.Error()})
			return
		}

		render.JSON(w, http.StatusOK, builds)
	})
}

func (b *builds) findBuild() http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// TODO: add authentication

		buildID, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		build, err := b.buildRepo.FindAll(uint(buildID))
		if err != nil {
			render.JSON(w, http.StatusNotFound, render.Error{Message: err.Error()})
			return
		}

		render.JSON(w, http.StatusOK, build)
	})
}

func (b *builds) triggerBuild() http.HandlerFunc {
	type form struct {
		ID uint `json:"id" valid:"required"`
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// TODO: add authentication

		claims := claimsFromCtx(r.Context())
		var f form
		var err error
		defer r.Body.Close()

		if err = lib.DecodeJSON(r.Body, &f); err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		if valid, err := govalidator.ValidateStruct(f); err != nil || !valid {
			render.JSON(w, http.StatusBadRequest, render.Error{Message: err.Error()})
			return
		}

		if err = b.buildService.TriggerBuild(f.ID, claims.ID); err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		render.JSON(w, http.StatusOK, render.Empty{})
	})
}

func (b *builds) restartBuild() http.HandlerFunc {
	type form struct {
		ID uint `json:"id" valid:"required"`
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// TODO: add authentication

		var f form
		var err error
		defer r.Body.Close()

		if err = lib.DecodeJSON(r.Body, &f); err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		if valid, err := govalidator.ValidateStruct(f); err != nil || !valid {
			render.JSON(w, http.StatusBadRequest, render.Error{Message: err.Error()})
			return
		}

		if err = b.buildService.RestartBuild(f.ID); err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		render.JSON(w, http.StatusOK, render.Empty{})
	})
}

func (b *builds) stopBuild() http.HandlerFunc {
	type form struct {
		ID uint `json:"id" valid:"required"`
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// TODO: add authentication

		var f form
		var err error
		defer r.Body.Close()

		if err = lib.DecodeJSON(r.Body, &f); err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		if valid, err := govalidator.ValidateStruct(f); err != nil || !valid {
			render.JSON(w, http.StatusBadRequest, render.Error{Message: err.Error()})
			return
		}

		if err = b.buildService.StopBuild(f.ID); err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		render.JSON(w, http.StatusOK, render.Empty{})
	})
}

func (b *builds) restartJob() http.HandlerFunc {
	type form struct {
		ID uint `json:"id" valid:"required"`
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// TODO: add authentication

		var f form
		var err error
		defer r.Body.Close()

		if err = lib.DecodeJSON(r.Body, &f); err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		if valid, err := govalidator.ValidateStruct(f); err != nil || !valid {
			render.JSON(w, http.StatusBadRequest, render.Error{Message: err.Error()})
			return
		}

		if err = b.buildService.RestartJob(f.ID); err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		render.JSON(w, http.StatusOK, render.Empty{})
	})
}

func (b *builds) stopJob() http.HandlerFunc {
	type form struct {
		ID uint `json:"id" valid:"required"`
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// TODO: add authentication

		var f form
		var err error
		defer r.Body.Close()

		if err = lib.DecodeJSON(r.Body, &f); err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		if valid, err := govalidator.ValidateStruct(f); err != nil || !valid {
			render.JSON(w, http.StatusBadRequest, render.Error{Message: err.Error()})
			return
		}

		if err = b.buildService.StopJob(f.ID); err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		render.JSON(w, http.StatusOK, render.Empty{})
	})
}
