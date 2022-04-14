package provider

import (
	"net/http"

	"github.com/asaskevich/govalidator"
	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/server/api/middlewares"
	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/core"
)

// HandleUpdate returns http.HandlerFunc which writes JSON encoded
// result about updating provider to the http response body.
func HandleUpdate(providers core.ProviderStore, users core.UserStore) http.HandlerFunc {
	type form struct {
		ID          uint   `json:"id" valid:"required"`
		Name        string `json:"name" valid:"stringlength(4|12),required"`
		URL         string `json:"url" valid:"url,required"`
		Host        string `json:"host" valid:"url,required"`
		AccessToken string `json:"accessToken"`
		Secret      string `json:"secret" valid:"stringlength(5|50),required"`
		HttpUser    string `json:"httpUser"`
		HttpPass    string `json:"httpPass"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		claims := middlewares.ClaimsFromCtx(r.Context())
		var f form
		var err error
		defer r.Body.Close()

		if err = lib.DecodeJSON(r.Body, &f); err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		if valid, err := govalidator.ValidateStruct(f); err != nil || !valid {
			render.BadRequestError(w, err.Error())
			return
		}

		user, err := users.Find(claims.ID)
		if err != nil {
			render.UnathorizedError(w, err.Error())
			return
		}

		p, err := providers.Find(f.ID)
		if err != nil {
			render.NotFoundError(w, err.Error())
			return
		}

		if p.UserID == claims.ID || user.Role == "admin" {
			provider := &core.Provider{
				ID:       f.ID,
				Name:     f.Name,
				URL:      f.URL,
				Host:     f.Host,
				Secret:   f.Secret,
				UserID:   claims.ID,
				HttpUser: f.HttpUser,
				HttpPass: f.HttpPass,
			}

			if f.AccessToken != "" {
				provider.AccessToken = f.AccessToken
			}

			if err := providers.Update(provider); err != nil {
				render.InternalServerError(w, err.Error())
				return
			}

			render.JSON(w, http.StatusOK, provider)
			return
		}

		render.UnathorizedError(w, err.Error())
	}
}
