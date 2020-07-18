package api

import (
	"net/http"

	"github.com/bleenco/abstruse/pkg/render"
	"github.com/bleenco/abstruse/server/config"
	"github.com/bleenco/abstruse/server/db/repository"
	"github.com/bleenco/abstruse/server/service"
)

type images struct {
	imageRepo    repository.ImageRepo
	imageService service.ImageService
}

func newImages(cfg *config.Registry) images {
	imageService, _ := service.NewImageService(cfg)

	return images{
		imageRepo:    repository.NewImageRepo(),
		imageService: imageService,
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
