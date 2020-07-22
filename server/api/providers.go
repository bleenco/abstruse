package api

import (
	"net/http"

	"github.com/asaskevich/govalidator"
	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/pkg/render"
	"github.com/bleenco/abstruse/server/db/model"
	"github.com/bleenco/abstruse/server/db/repository"
	"go.uber.org/zap"
)

type providers struct {
	logger       *zap.SugaredLogger
	providerRepo repository.ProviderRepo
}

func newProviders(logger *zap.Logger) providers {
	return providers{
		logger:       logger.With(zap.String("api", "providers")).Sugar(),
		providerRepo: repository.NewProviderRepo(),
	}
}

func (p *providers) find() http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		claims := claimsFromCtx(r.Context())

		providers, err := p.providerRepo.Find(claims.ID)
		if err != nil {
			render.JSON(w, http.StatusNotFound, render.Error{Message: err.Error()})
			return
		}

		render.JSON(w, http.StatusOK, providers)
	})
}

func (p *providers) create() http.HandlerFunc {
	type form struct {
		Name        string `json:"name" valid:"stringlength(5|12),required"`
		URL         string `json:"url" valid:"url,required"`
		Host        string `json:"host" valid:"url,required"`
		AccessToken string `json:"accessToken" valid:"stringlength(12|50),required"`
		Secret      string `json:"secret" valid:"stringlength(5|50),required"`
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
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

		provider := model.Provider{
			Name:        f.Name,
			URL:         f.URL,
			Host:        f.Host,
			AccessToken: f.AccessToken,
			Secret:      f.Secret,
			UserID:      claims.ID,
		}

		provider, err = p.providerRepo.Create(provider)
		if err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		render.JSON(w, http.StatusOK, provider)
	})
}

func (p *providers) update() http.HandlerFunc {
	type form struct {
		ID          uint   `json:"id" valid:"required"`
		Name        string `json:"name" valid:"stringlength(5|12),required"`
		URL         string `json:"url" valid:"url,required"`
		Host        string `json:"host" valid:"url,required"`
		AccessToken string `json:"accessToken" valid:"stringlength(12|50)"`
		Secret      string `json:"secret" valid:"stringlength(5|50),required"`
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
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

		provider := model.Provider{
			ID:          f.ID,
			Name:        f.Name,
			URL:         f.URL,
			Host:        f.Host,
			AccessToken: f.AccessToken,
			Secret:      f.Secret,
			UserID:      claims.ID,
		}

		provider, err = p.providerRepo.Update(provider)
		if err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		render.JSON(w, http.StatusOK, provider)
	})
}

func (p *providers) sync() http.HandlerFunc {
	type form struct {
		ID uint `json:"id" valid:"required"`
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
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

		if err := p.providerRepo.Sync(f.ID, claims.ID); err != nil {
			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
			return
		}

		render.JSON(w, http.StatusOK, render.Empty{})
	})
}
