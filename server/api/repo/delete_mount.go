package repo

import (
	"net/http"
	"strconv"

	"github.com/bleenco/abstruse/server/api/middlewares"
	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/core"
	"github.com/go-chi/chi"
)

// HandleDeleteMount returns http.HandlerFunc that writes JSON encoded
// result about deleting mount to the http response body.
func HandleDeleteMount(mount core.MountsStore, repos core.RepositoryStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims := middlewares.ClaimsFromCtx(r.Context())

		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		if perm := repos.GetPermissions(uint(id), claims.ID); !perm.Write {
			render.UnathorizedError(w, "permission denied")
			return
		}

		mntid, err := strconv.Atoi(chi.URLParam(r, "mountid"))
		if err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		mnt, err := mount.Find(uint(mntid))
		if err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		if err := mount.Delete(mnt); err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		render.JSON(w, http.StatusOK, render.Empty{})
	}
}
