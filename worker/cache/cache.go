package cache

import (
	"archive/tar"
	"compress/gzip"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"

	api "github.com/bleenco/abstruse/pb"
	"github.com/bleenco/abstruse/pkg/fs"
)

func SaveCache(job *api.Job, dir string) (string, error) {
	fileName := strings.ReplaceAll(fmt.Sprintf("%s-%s.tgz", job.GetRepoName(), job.GetBranch()), "/", "_")
	out := filepath.Join(dir, fileName)

	if fs.Exists(out) {
		if err := os.RemoveAll(out); err != nil {
			return out, err
		}
	}

	return out, createArchive(job.GetCache(), out)
}

func createArchive(folders []string, outPath string) error {
	out, err := os.Create(outPath)
	if err != nil {
		return err
	}
	defer out.Close()

	gw := gzip.NewWriter(out)
	defer gw.Close()

	tw := tar.NewWriter(gw)
	defer tw.Close()

	for _, folder := range folders {
		folder = filepath.Join(filepath.Dir(outPath), folder)
		if err := filepath.Walk(folder, func(path string, info os.FileInfo, err error) error {
			if info.IsDir() {
				return nil
			}

			if err != nil {
				return err
			}

			link := ""
			if info.Mode()&os.ModeSymlink != 0 {
				link, err = os.Readlink(path)
				if err != nil {
					return err
				}
			}

			header, err := tar.FileInfoHeader(info, link)
			if err != nil {
				return err
			}

			header.Name = strings.TrimPrefix(path, fmt.Sprintf("%s/", filepath.Dir(outPath)))

			if err := tw.WriteHeader(header); err != nil {
				return err
			}

			switch header.Typeflag {
			case tar.TypeLink, tar.TypeSymlink, tar.TypeChar, tar.TypeBlock, tar.TypeDir, tar.TypeFifo:
			default:
				file, err := os.Open(path)
				if err != nil {
					return err
				}

				if _, err := io.Copy(tw, file); err != nil {
					return err
				}
			}

			return nil
		}); err != nil {
			return err
		}
	}

	return nil
}
