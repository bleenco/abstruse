package user

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path"
	"path/filepath"

	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/server/api/render"
)

// HandleAvatar returns http.HandlerFunc that writes JSON encoded
// result about uploaded avatar to the http response body.
func HandleAvatar(uploadDir string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		r.ParseMultipartForm(3 << 20)

		file, header, err := r.FormFile("file")
		if err != nil {
			render.InternalServerError(w, err.Error())
			return
		}
		defer file.Close()

		fileName := fmt.Sprintf("%s%s", lib.RandomString(), filepath.Ext(header.Filename))
		filePath := filepath.Join(uploadDir, "avatars", fileName)

		uploadedFile, err := os.OpenFile(filePath, os.O_WRONLY|os.O_CREATE, 0666)
		if err != nil {
			render.InternalServerError(w, err.Error())
			return
		}
		defer uploadedFile.Close()

		if _, err := io.Copy(uploadedFile, file); err != nil {
			render.InternalServerError(w, err.Error())
			return
		}

		render.JSON(w, http.StatusOK, path.Join("/uploads/avatars/", fileName))
	}
}
