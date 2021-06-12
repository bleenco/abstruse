package cache

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	api "github.com/bleenco/abstruse/pb"
	"github.com/bleenco/abstruse/pkg/fs"
	"github.com/mholt/archiver/v3"
)

func SaveCache(job *api.Job, dir string) (string, error) {
	fileName := strings.ReplaceAll(fmt.Sprintf("%s-%s.tgz", job.GetRepoName(), job.GetRef()), "/", "_")
	out := filepath.Join(dir, fileName)
	cwd, err := os.Getwd()
	if err != nil {
		return out, err
	}
	defer os.Chdir(cwd)

	if err := os.Chdir(dir); err != nil {
		return out, err
	}

	if fs.Exists(out) {
		if err := os.RemoveAll(out); err != nil {
			return out, err
		}
	}

	return out, archiver.Archive(job.GetCache(), out)
}
