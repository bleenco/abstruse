package docker

import (
	"archive/tar"
	"bytes"
	"context"
	"encoding/binary"
	"io"
	"os"
	"path"

	_ "github.com/bleenco/abstruse/worker/data" // Compressed static files.
	"github.com/docker/docker/api/types"
	"github.com/jkuri/statik/fs"
)

// BuildImage builds Docker image from Dockerfile and additional files.
func BuildImage(tags []string, folderPath string) error {
	ctx := context.Background()
	cli, err := GetClient()
	if err != nil {
		return err
	}

	buf := new(bytes.Buffer)
	tw := tar.NewWriter(buf)

	statikFS, err := fs.New()
	if err != nil {
		return err
	}

	files, err := statikFS.Readdir(folderPath)
	if err != nil {
		return err
	}

	for _, file := range files {
		filePath := path.Join(folderPath, file)

		fileData, err := statikFS.Readfile(filePath)
		if err != nil {
			return err
		}

		header := &tar.Header{
			Name: file,
			Size: int64(binary.Size(fileData)),
		}

		if err := tw.WriteHeader(header); err != nil {
			return err
		}

		if _, err := io.Copy(tw, bytes.NewReader(fileData)); err != nil {
			return err
		}
	}

	tw.Close()

	imageContext := bytes.NewReader(buf.Bytes())

	imageBuildResponse, err := cli.ImageBuild(
		ctx,
		imageContext,
		types.ImageBuildOptions{
			Tags:       tags,
			Context:    imageContext,
			Dockerfile: "Dockerfile",
			Remove:     true,
			PullParent: true,
		},
	)
	if err != nil {
		return err
	}
	defer imageBuildResponse.Body.Close()

	_, err = io.Copy(os.Stdout, imageBuildResponse.Body)
	if err != nil {
		return err
	}

	return nil
}
