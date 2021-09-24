package worker

import (
	"io"
	"log"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strings"

	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/server/config"
	"github.com/mholt/archiver/v3"
)

// HandleUploadArchive returns http.handlerFunc that writes JSON encoded
// result about uploading cache to the http response body.
func HandleUploadArchive(config *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		r.ParseMultipartForm(1000 << 20)

		src, handler, err := r.FormFile("file")
		if err != nil {
			render.InternalServerError(w, err.Error())
			return
		}
		defer src.Close()
		os.MkdirAll(filepath.Join(config.DataDir, "archive"), 0750)
		filePath := filepath.Join(config.DataDir, "archive", handler.Filename)
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

		if err = treatArchive(filePath, config.DataDir); err != nil {
			render.InternalServerError(w, err.Error())
			return
		}
		render.JSON(w, http.StatusOK, render.BoolResponse{Status: true})
	}
}

func treatArchive(filePath, datadir string) error {
	idSplit := strings.Split(strings.ReplaceAll(filePath, "/", "."), ".")
	//                              The job id
	targetDir := path.Join(datadir, "archive", idSplit[len(idSplit)-2])
	os.MkdirAll(targetDir, 0750)
	log.Println(filePath, "/", targetDir)
	defer os.RemoveAll(filePath)
	return archiver.Unarchive(filePath, targetDir)
}
