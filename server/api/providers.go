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

// func (p *providers) repos() http.HandlerFunc {
// 	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
// 		claims := claimsFromCtx(r.Context())
// 		providerID, err := strconv.Atoi(chi.URLParam(r, "id"))
// 		if err != nil {
// 			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
// 			return
// 		}
// 		page, err := strconv.Atoi(r.URL.Query().Get("page"))
// 		if err != nil {
// 			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
// 			return
// 		}
// 		size, err := strconv.Atoi(r.URL.Query().Get("size"))
// 		if err != nil {
// 			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
// 			return
// 		}

// 		repos, err := p.providerRepo.FindRepos(uint(providerID), claims.ID, page, size)
// 		if err != nil {
// 			render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
// 			return
// 		}

// 		render.JSON(w, http.StatusOK, repos)
// 	})
// }
