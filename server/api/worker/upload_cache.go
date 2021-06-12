package worker

import (
	"io"
	"net/http"
	"os"
	"path/filepath"

	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/config"
)

// HandleUploadCache returns http.handlerFunc that writes JSON encoded
// result about uploading cache to the http response body.
func HandleUploadCache(config *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		r.ParseMultipartForm(1000 << 20)

		src, handler, err := r.FormFile("file")
		if err != nil {
			render.InternalServerError(w, err.Error())
			return
		}
		defer src.Close()

		filePath := filepath.Join(config.DataDir, "cache", handler.Filename)
		dst, err := os.Create(filePath)
		if err != nil {
			render.InternalServerError(w, err.Error())
			return
		}
		defer dst.Close()

		if _, err := io.Copy(dst, src); err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		render.JSON(w, http.StatusOK, render.BoolResponse{Status: true})
	}
}
