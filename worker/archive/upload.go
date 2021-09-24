package archive

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"

	"github.com/bleenco/abstruse/internal/auth"
	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/worker/config"
	"github.com/bleenco/abstruse/worker/http"
)

func UploadArchive(config *config.Config, filePath string) error {
	type response struct {
		Status bool `json:"status"`
	}

	file, err := os.Open(filePath)
	if err != nil {
		return err
	}
	defer file.Close()

	body := new(bytes.Buffer)
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile("file", filepath.Base(filePath))
	if err != nil {
		return err
	}

	if _, err := io.Copy(part, file); err != nil {
		return err
	}

	if err := writer.Close(); err != nil {
		return err
	}

	req := &http.Request{
		Method: "POST",
		Path:   "/api/v1/workers/archive",
		Body:   body,
		Header: map[string][]string{
			"Content-Type": {writer.FormDataContentType()},
		},
	}

	token, err := auth.JWT.CreateWorkerJWT(auth.WorkerClaims{
		ID:   config.ID,
		Addr: config.GRPC.Addr,
	})
	if err != nil {
		return err
	}

	client, err := http.NewClient(config.Server.Addr, token)
	if err != nil {
		return err
	}

	resp, err := client.Req(context.Background(), req, nil)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.Status == 200 {
		var r response
		if err := lib.DecodeJSON(resp.Body, &r); err != nil {
			return err
		}

		if r.Status {
			return nil
		}

		return fmt.Errorf("unknown status")
	}

	var r render.Error
	if err := lib.DecodeJSON(resp.Body, &r); err != nil {
		return err
	}

	return fmt.Errorf("error uploading archive to abstruse server: %s", r.Message)
}
