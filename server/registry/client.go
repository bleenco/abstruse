package registry

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"strings"

	"github.com/bleenco/abstruse/pkg/httpclient"
	"github.com/bleenco/abstruse/pkg/lib"
)

// Client represents the Docker image registry client.
type Client struct {
	*httpclient.Client
}

// NewClient returns new Docker image registry client.
func NewClient(uri, username, password string) (*Client, error) {
	base, err := url.Parse(uri)
	if err != nil {
		return nil, err
	}
	if !strings.HasSuffix(base.Path, "/") {
		base.Path = fmt.Sprintf("%s/", base.Path)
	}

	c := &Client{new(httpclient.Client)}
	c.BaseURL = base
	c.Client.Client = &http.Client{
		Transport: &httpclient.BasicAuth{
			Username: username,
			Password: password,
		},
	}

	return c, nil
}

// Find list all repositories with images and tags stored in registry.
func (c *Client) Find() ([]Image, error) {
	var images []Image
	ctx := context.Background()

	repos, _, err := c.findRepos(ctx)
	if err != nil {
		return images, err
	}
	for _, name := range repos.Repositories {
		image := Image{Name: name}
		tags, _, err := c.findTags(ctx, name)
		if err != nil {
			return images, err
		}
		for _, tag := range tags.Tags {
			manifest, err := c.FindManifest(ctx, name, tag)
			if err != nil {
				return images, err
			}
			image.Tags = append(image.Tags, Tag{Tag: tag, Digest: manifest.Digest, Size: manifest.Size})
		}
		images = append(images, image)
	}

	return images, nil
}

// FindManifest returns manifest info about image with specified tag.
func (c *Client) FindManifest(ctx context.Context, name, tag string) (*ManifestResp, error) {
	endpoint := fmt.Sprintf("/%s/manifests/%s", name, tag)
	out := new(ManifestResp)

	req := &httpclient.Request{
		Method: "GET",
		Path:   endpoint,
	}

	headers := make(http.Header)
	headers.Add("Accept", "application/vnd.docker.distribution.manifest.v2+json")

	resp, err := c.Req(ctx, req, headers)
	if err != nil {
		return out, err
	}
	defer resp.Body.Close()

	var response manifest
	if err := lib.DecodeJSON(resp.Body, &response); err != nil {
		return out, err
	}

	var size int
	for _, layer := range response.Layers {
		size += layer.Size
	}

	out.Size = size
	out.Digest = response.Config.Digest

	return out, nil
}

func (c *Client) findTags(ctx context.Context, name string) (*tagsResp, *httpclient.Response, error) {
	endpoint := fmt.Sprintf("/%s/tags/list", name)
	out := new(tagsResp)
	res, err := c.Client.Do(ctx, "GET", endpoint, nil, out)
	return out, res, err
}

func (c *Client) findRepos(ctx context.Context) (*reposResp, *httpclient.Response, error) {
	endpoint := fmt.Sprintf("/_catalog")
	out := new(reposResp)
	res, err := c.Client.Do(ctx, "GET", endpoint, nil, out)
	return out, res, err
}

// Image data struct for response.
type Image struct {
	Name string `json:"name"`
	Tags []Tag  `json:"tags"`
}

// Tag data struct for response.
type Tag struct {
	Tag    string `json:"tag"`
	Digest string `json:"digest"`
	Size   int    `json:"size"`
}

type reposResp struct {
	Repositories []string `json:"repositories"`
}

type tagsResp struct {
	Name string   `json:"name"`
	Tags []string `json:"tags"`
}

// ManifestResp manifest data.
type ManifestResp struct {
	Digest string `json:"digest"`
	Size   int    `json:"size"`
}

type manifest struct {
	SchemaVersion int    `json:"schemaVersion"`
	MediaType     string `json:"mediaType"`
	Config        struct {
		MediaType string `json:"mediaType"`
		Size      int    `json:"size"`
		Digest    string `json:"digest"`
	} `json:"config"`
	Layers []struct {
		MediaType string `json:"mediaType"`
		Size      int    `json:"size"`
		Digest    string `json:"digest"`
	} `json:"layers"`
}
