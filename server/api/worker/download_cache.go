package worker

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"github.com/bleenco/abstruse/pkg/fs"
	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/config"
)

// HandleDownloadCache returns http.handlerFunc that writes
// cache file to the http response body (if found).
func HandleDownloadCache(config *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Query().Get("file") == "" {
			render.BadRequestError(w, "file not specified")
			return
		}

		filePath := filepath.Join(config.DataDir, "cache", r.URL.Query().Get("file"))
		if !fs.Exists(filePath) {
			render.InternalServerError(w, "file not found")
			return
		}

		file, err := os.Open(filePath)
		if err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		fileHeader := make([]byte, 512)
		if _, err := file.Read(fileHeader); err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		stat, err := file.Stat()
		if err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", filepath.Base(filePath)))
		w.Header().Set("Content-Type", http.DetectContentType(fileHeader))
		w.Header().Set("Content-Length", strconv.FormatInt(stat.Size(), 10))

		if _, err := file.Seek(0, 0); err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		if _, err := io.Copy(w, file); err != nil {
			render.InternalServerError(w, err.Error())
			return
		}
	}
}
