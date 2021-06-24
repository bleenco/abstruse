package repo

import (
	"net/http"
	"strconv"

	"github.com/asaskevich/govalidator"
	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/server/api/middlewares"
	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/core"
	"github.com/go-chi/chi"
)

// HandleUpdateMount returns an http.HandlerFunc that writes json encoded
// result about updating mount to the http response body.
func HandleUpdateMount(mount core.MountsStore, repos core.RepositoryStore) http.HandlerFunc {
	type form struct {
		ID        uint   `json:"id" valid:"required"`
		Host      string `json:"host" valid:"required"`
		Container string `json:"container" valid:"required"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		claims := middlewares.ClaimsFromCtx(r.Context())
		var f form
		var err error
		defer r.Body.Close()

		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		if err = lib.DecodeJSON(r.Body, &f); err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		if valid, err := govalidator.ValidateStruct(f); err != nil || !valid {
			render.BadRequestError(w, err.Error())
			return
		}

		if perm := repos.GetPermissions(uint(id), claims.ID); !perm.Write {
			render.UnathorizedError(w, "permission denied")
			return
		}

		mnt, err := mount.Find(f.ID)
		if err != nil {
			render.NotFoundError(w, err.Error())
			return
		}

		mnt.Host = f.Host
		mnt.Container = f.Container

		if err := mount.Update(mnt); err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		render.JSON(w, http.StatusOK, mnt)
	}
}
