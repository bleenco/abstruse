package build

import (
	"net/http"
	"os"
	"path"
	"strconv"
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
