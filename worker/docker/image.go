package docker

import (
	"archive/tar"
	"bytes"
	"context"
	"encoding/base64"
	"encoding/binary"
	"encoding/json"
	"io"
	"io/ioutil"
	"path"
	"strings"

	"github.com/bleenco/abstruse/worker/config"
	"github.com/docker/docker/api/types"
	"github.com/docker/docker/client"
	"github.com/docker/docker/pkg/jsonmessage"
)

// ImageBuildOutput defines log output when building image.
type ImageBuildOutput struct {
	Stream string `json:"stream"`
}

// BuildImage builds the docker image.
func BuildImage(tags []string, dockerFile string) (types.ImageBuildResponse, error) {
	ctx := context.Background()
	cli, err := client.NewClientWithOpts()
	if err != nil {
		panic(err)
	}

	tags = configureTags(tags)
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

// PushImage pushes image to the registry.
func PushImage(tag string) (io.ReadCloser, error) {
	ctx := context.Background()
	cli, err := client.NewClientWithOpts()
	if err != nil {
		panic(err)
	}
	tag = prependTag(tag)

	authConfig := types.AuthConfig{Username: cfg.Username, Password: cfg.Password}
	authJSON, _ := json.Marshal(authConfig)
	auth := base64.URLEncoding.EncodeToString(authJSON)

	return cli.ImagePush(ctx, tag, types.ImagePushOptions{RegistryAuth: auth})
}

// PullImage pulls image from the registry.
func PullImage(image string, platform string, config *config.Registry) error {
	ctx := context.Background()
	cli, err := client.NewClientWithOpts()
	if err != nil {
		panic(err)
	}

	opts := types.ImagePullOptions{
		Platform: platform,
	}

	if cfg.Username != "" && cfg.Password != "" {
		authConfig := types.AuthConfig{Username: cfg.Username, Password: cfg.Password}
		authJSON, _ := json.Marshal(authConfig)
		opts.RegistryAuth = base64.URLEncoding.EncodeToString(authJSON)
	}

	out, err := cli.ImagePull(ctx, image, opts)
	if err != nil {
		return err
	}

	defer out.Close()
	if _, rerr := ioutil.ReadAll(out); rerr != nil {
		return rerr
	}
	return nil
}

// ListImages returns all images.
func ListImages() []types.ImageSummary {
	cli, err := client.NewClientWithOpts()
	if err != nil {
		panic(err)
	}
	images, err := cli.ImageList(context.Background(), types.ImageListOptions{})
	if err != nil {
		panic(err)
	}

	return images
}

// StreamImageEvents streams output of an operation on image to a given out channel
// passed as a parameter.
func StreamImageEvents(out chan<- jsonmessage.JSONMessage, events io.ReadCloser) {
	var event jsonmessage.JSONMessage
	decoder := json.NewDecoder(events)
	defer close(out)

	for {
		if err := decoder.Decode(&event); err != nil {
			break
		}
		out <- event
	}
}

func configureTags(tags []string) []string {
	for i, tag := range tags {
		tags[i] = prependTag(tag)
	}
	return tags
}

func prependTag(tag string) string {
	if !strings.HasPrefix(tag, cfg.Addr) {
		tag = path.Clean(path.Join(cfg.Addr, tag))
	}
	return tag
}
