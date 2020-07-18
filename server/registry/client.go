package registry

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/bleenco/abstruse/pkg/httpclient"
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
			manifest, err := c.findManifest(ctx, name, tag)
			if err != nil {
				return images, err
			}
			image.Tags = append(image.Tags, Tag{Tag: tag, Digest: manifest.Digest, Date: manifest.Date})
		}
		images = append(images, image)
	}

	return images, nil
}

func (c *Client) findManifest(ctx context.Context, name, tag string) (*manifestResp, error) {
	endpoint := fmt.Sprintf("/%s/manifests/%s", name, tag)
	out := new(manifestResp)

	req := &httpclient.Request{
		Method: "HEAD",
		Path:   endpoint,
	}

	resp, err := c.Req(ctx, req)
	if err != nil {
		return nil, err
	}

	out.Digest = resp.Header.Get("Docker-Content-Digest")
	date, err := time.Parse(http.TimeFormat, resp.Header.Get("Date"))
	if err != nil {
		return nil, err
	}
	out.Date = date
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
	Tag    string    `json:"tag"`
	Digest string    `json:"digest"`
	Date   time.Time `json:"date"`
}

type reposResp struct {
	Repositories []string `json:"repositories"`
}

type tagsResp struct {
	Name string   `json:"name"`
	Tags []string `json:"tags"`
}

type manifestResp struct {
	Digest string    `json:"digest"`
	Date   time.Time `json:"date"`
}
