package docker

import (
	"archive/tar"
	"bytes"
	"context"
	"encoding/base64"
	"encoding/binary"
	"encoding/json"
	"io"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/client"
)

// ImageBuildOutput defines log output when building image.
type ImageBuildOutput struct {
	Stream string `json:"stream"`
}

// BuildImage builds the docker image.
func BuildImage(tags []string, dockerFile string) (types.ImageBuildResponse, error) {
	ctx := context.Background()
	cli, err := client.NewEnvClient()
	if err != nil {
		panic(err)
	}

	dockerfile := []byte(dockerFile)
	buf := new(bytes.Buffer)
	tw := tar.NewWriter(buf)

	header := &tar.Header{
		Name: "Dockerfile",
		Size: int64(binary.Size(dockerfile)),
	}

	if err := tw.WriteHeader(header); err != nil {
		panic(err)
	}

	if _, err := io.Copy(tw, bytes.NewReader(dockerfile)); err != nil {
		panic(err)
	}
	tw.Close()

	imageContext := bytes.NewReader(buf.Bytes())

	return cli.ImageBuild(
		ctx,
		imageContext,
		types.ImageBuildOptions{
			Tags:        tags,
			Context:     imageContext,
			Dockerfile:  "Dockerfile",
			Remove:      true,
			ForceRemove: true,
			PullParent:  true,
			NoCache:     true,
		},
	)
}

// PushImage pushes image to the registry
func PushImage(image, username, password string) (io.ReadCloser, error) {
	ctx := context.Background()
	cli, err := client.NewEnvClient()
	if err != nil {
		panic(err)
	}

	authConfig := types.AuthConfig{Username: username, Password: password}
	authJSON, _ := json.Marshal(authConfig)
	auth := base64.URLEncoding.EncodeToString(authJSON)

	return cli.ImagePush(ctx, image, types.ImagePushOptions{RegistryAuth: auth})
}

// ListImages returns all images.
func ListImages() []types.ImageSummary {
	cli, err := client.NewEnvClient()
	if err != nil {
		panic(err)
	}
	images, err := cli.ImageList(context.Background(), types.ImageListOptions{})
	if err != nil {
		panic(err)
	}

	return images
}
