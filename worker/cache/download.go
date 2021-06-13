package cache

import (
	"context"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"

	"github.com/bleenco/abstruse/internal/auth"
	api "github.com/bleenco/abstruse/pb"
	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/server/api/render"
	"github.com/bleenco/abstruse/worker/config"
	"github.com/bleenco/abstruse/worker/http"
	"github.com/mholt/archiver/v3"
)

func DownloadCache(config *config.Config, job *api.Job, dir string) (string, error) {
	fileName := strings.ReplaceAll(fmt.Sprintf("%s-%s.tgz", job.GetRepoName(), job.GetRef()), "/", "_")
	outPath := filepath.Join(dir, fileName)

	out, err := os.Create(outPath)
	if err != nil {
		return outPath, err
	}
	defer out.Close()

	token, err := auth.JWT.CreateWorkerJWT(auth.WorkerClaims{
		ID:   config.ID,
		Addr: config.GRPC.Addr,
	})
	if err != nil {
		return outPath, err
	}

	client, err := http.NewClient(config.Server.Addr, token)
	if err != nil {
		return outPath, err
	}

	req := &http.Request{
		Method: "GET",
		Path:   fmt.Sprintf("/api/v1/workers/cache?file=%s", fileName),
	}

	resp, err := client.Req(context.Background(), req, nil)
	if err != nil {
		return outPath, err
	}
	defer resp.Body.Close()

	if resp.Status != 200 {
		var r render.Error
		if err := lib.DecodeJSON(resp.Body, &r); err != nil {
			return outPath, err
		}

		return outPath, fmt.Errorf(r.Message)
	}

	if _, err := io.Copy(out, resp.Body); err != nil {
		return outPath, err
	}

	if err := out.Close(); err != nil {
		return outPath, err
	}

	return outPath, archiver.Unarchive(outPath, dir)
}
