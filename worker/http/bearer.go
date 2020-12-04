package http

import (
	"fmt"
	"net/http"
)

// TokenAuth is an http.RoundTripper that makes HTTP
// requests, wrapping a base RoundTripper and adding
// a bearer token authorization header.
type TokenAuth struct {
	Base  http.RoundTripper
	Token string
}

// RoundTrip adds the Authorization header to the request.
func (t *TokenAuth) RoundTrip(r *http.Request) (*http.Response, error) {
	if r.Header.Get("Authorization") != "" {
		return t.base().RoundTrip(r)
	}
	req := cloneRequest(r)
	req.Header.Add("Authorization", t.token())
	return t.base().RoundTrip(req)
}

func (t *TokenAuth) base() http.RoundTripper {
	if t.Base != nil {
		return t.Base
	}
	return http.DefaultTransport
}

func (t *TokenAuth) token() string {
	return fmt.Sprintf("Bearer %s", t.Token)
}

func cloneRequest(r *http.Request) *http.Request {
	req := new(http.Request)
	*req = *r
	req.Header = make(http.Header, len(r.Header))
	for k, s := range r.Header {
		req.Header[k] = append([]string(nil), s...)
	}
	return req
}
