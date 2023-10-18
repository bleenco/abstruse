package build

import (
	"math"
	"net/http"
	"os"
	"path"
	"strconv"
	"strings"
	"time"

	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/config"
	"github.com/bleenco/abstruse/server/core"
	"github.com/go-chi/chi"
)

func HandleArchive(jobs core.JobStore, config *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id, err := strconv.Atoi(chi.URLParam(r, "id"))
		if err != nil {
			render.BadRequestError(w, err.Error())
			return
		}

		file := path.Join(config.DataDir, "archive", strconv.Itoa(id), r.URL.Path[len(strconv.Itoa(id))+9:])
		f, err := os.Open(file)
		if err != nil {
			render.NotFoundError(w, err.Error())
			return
		}
		defer f.Close()
		http.ServeContent(w, r, "", time.Now(), f)
	}
}

func HandleArchiveRedirect(jobs core.JobStore, repos core.RepositoryStore, builds core.BuildStore, config *config.Config) http.HandlerFunc {
	//{username}/{repo}/{branch}/{buildid}
	return func(w http.ResponseWriter, r *http.Request) {
		buildid, err := strconv.Atoi(chi.URLParam(r, "buildid"))
		if err != nil && chi.URLParam(r, "buildid") != "latest" {
			render.BadRequestError(w, err.Error())
			return
		}
		matrixid, err := strconv.Atoi(chi.URLParam(r, "matrixid"))
		if err != nil {
			render.BadRequestError(w, err.Error())
			return
		}
		username := chi.URLParam(r, "username")
		repo := chi.URLParam(r, "repo")
		branch := chi.URLParam(r, "branch")
		//platform := chi.URLParam(r, "platform")
		pull := chi.URLParam(r, "pull")
		repository, err := repos.FindArchive(username, repo)
		if err != nil {
			render.BadRequestError(w, err.Error())
			return
		}
		builds, err := builds.List(core.BuildFilter{
			RepositoryID: int(repository.ID),
			UserID:       repository.UserID, // TOOD:?
			Limit:        math.MaxInt,
		})
		if err != nil {
			render.BadRequestError(w, err.Error())
			return
		}
		var j *core.Job
		found := false
		for i := range builds {
			if builds[i].ID != uint(buildid) && chi.URLParam(r, "buildid") != "latest" {
				continue
			}
			if strconv.Itoa(builds[i].PR) != pull {
				// TODO:
				continue
			}
			if strings.ReplaceAll(builds[i].Branch, "/", "-") != branch {
				continue
			}
			if matrixid >= len(builds[i].Jobs) {
				if err != nil {
					render.BadRequestError(w, "matrixid is bigger than len(builds[i].Jobs)")
					return
				}
			}
			// Waiting for #563 to get merged
			//for k := range builds[i].Jobs {
			//	if platform == "0" || platform == "" || platform == builds[i].Jobs[k].Platform {
			//
			//	}
			//}
			j = builds[i].Jobs[matrixid]
			found = true
			break
		}
		if !found {
			render.BadRequestError(w, "Unable to find requested job.")
			return
		}
		// render.JSON(w, 200, j)
		u := strings.Split(r.RequestURI, "/")
		if len(u) > 9 {
			w.Header().Set("Location", "/archive/"+strconv.Itoa(int(j.ID))+"/"+strings.Join(u[9:], "/"))
		} else {
			w.Header().Set("Location", "/archive/"+strconv.Itoa(int(j.ID))+"/")
		}
		w.WriteHeader(302)
		return
	}
}
