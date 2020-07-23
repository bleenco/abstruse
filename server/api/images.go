package api

import (
	"context"
	"net/http"

	"github.com/asaskevich/govalidator"
	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/pkg/render"
	"github.com/bleenco/abstruse/server/config"
	"github.com/bleenco/abstruse/server/core"
	"github.com/bleenco/abstruse/server/db/repository"
	"github.com/bleenco/abstruse/server/service"
)

type images struct {
	imageRepo    repository.ImageRepo
	imageService service.ImageService
	app          *core.App
}

func newImages(cfg *config.Registry, app *core.App) images {
	imageService, _ := service.NewImageService(cfg)

	return images{
		imageRepo:    repository.NewImageRepo(),
		imageService: imageService,
		app:          app,
	}
}

func (i *images) find() http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		images, err := i.imageRepo.Find()
		if err != nil {
			render.JSON(w, http.StatusNotFound, render.Error{Message: err.Error()})
			return
		}

		render.JSON(w, http.StatusOK, images)
	})
}

func (i *images) sync() http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if err := i.imageService.Sync(); err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		render.JSON(w, http.StatusOK, render.Empty{})
	})
}

func (i *images) build() http.HandlerFunc {
	type form struct {
		Name       string   `json:"name" valid:"required"`
		Tags       []string `json:"tags" valid:"required"`
		Dockerfile string   `json:"dockerfile" valud:"required"`
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
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

		if err := i.app.BuildImage(context.Background(), f.Name, f.Dockerfile, f.Tags); err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		render.JSON(w, http.StatusOK, render.Empty{})
	})
}
