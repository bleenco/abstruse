package docker

import (
	"archive/tar"
	"bytes"
	"context"
	"encoding/binary"
	"io"
	"os"
	"path"

	"github.com/bleenco/abstruse/worker/data"
	"github.com/docker/docker/api/types"
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

	files, err := data.AssetDir(folderPath)
	if err != nil {
		return err
	}

	for _, file := range files {
		filePath := path.Join(folderPath, file)

		fileData, err := data.Asset(filePath)
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
			Squash:     true,
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
