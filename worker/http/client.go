package http

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"path"
	"strings"
)

type (
	// Client represents an HTTP client.
	Client struct {
		Client  *http.Client
		BaseURL *url.URL
	}

	// Request defines an HTTP request.
	Request struct {
		Method string
		Path   string
		Header http.Header
		Body   io.Reader
	}

	// Response defines an HTTP response.
	Response struct {
		Status int
		Header http.Header
		Body   io.ReadCloser
	}
)

// NewClient returns new HTTP Client instance.
func NewClient(uri, token string) (*Client, error) {
	base, err := url.Parse(uri)
	if err != nil {
		return nil, err
	}
	if !strings.HasSuffix(base.Path, "/") {
		base.Path = fmt.Sprintf("%s/", base.Path)
	}

	client := &Client{
		BaseURL: base,
		Client: &http.Client{
			Transport: &TokenAuth{Token: token},
		},
	}

	return client, nil
}

// Do executes an HTTP request.
func (c *Client) Do(ctx context.Context, method, path string, in, out interface{}) (*Response, error) {
	req := &Request{
		Method: method,
		Path:   path,
	}

	if in != nil {
		var buf *bytes.Buffer
		json.NewEncoder(buf).Encode(in)
		req.Header = map[string][]string{
			"Content-Type": {"application/json"},
		}
		req.Body = buf
	}

	res, err := c.Req(ctx, req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	// if an error is encountered, unmarshal and return the error response.
	if res.Status > 300 {
		err := new(Error)
		json.NewDecoder(res.Body).Decode(err)
		return res, err
	}

	return res, json.NewDecoder(res.Body).Decode(out)
}

// Req sends an API request and returns the API response.
// The API reponse is JSON decoded and stored in the value,
// or returned as an error if an API error has occured.
func (c *Client) Req(ctx context.Context, in *Request, headers ...http.Header) (*Response, error) {
	u, err := url.Parse(c.BaseURL.String() + in.Path)
	if err != nil {
		return nil, err
	}
	u.Path = path.Clean(u.Path)
	req, err := http.NewRequest(in.Method, u.String(), in.Body)
	if err != nil {
		return nil, err
	}

	req = req.WithContext(ctx)
	if in.Header != nil {
		req.Header = in.Header
	}
	for _, header := range headers {
		for name, values := range header {
			for _, value := range values {
				req.Header.Add(name, value)
			}
		}
	}

	client := c.Client
	if client == nil {
		client = http.DefaultClient
	}

	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	return newResponse(res), nil
}

func newResponse(r *http.Response) *Response {
	return &Response{
		Status: r.StatusCode,
		Header: r.Header,
		Body:   r.Body,
	}
}

// Error represents response error.
type Error struct {
	Message string `json:"message"`
}

func (e *Error) Error() string {
	return e.Message
}
