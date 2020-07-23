package httpclient

import "net/http"

// BasicAuth is an http.RoundTripper that makes HTTP
// requests, wrapping a base RoundTripper and adding
// a basic authorization header.
type BasicAuth struct {
	Base     http.RoundTripper
	Username string
	Password string
}

// RoundTrip adds the Authorization header to the request.
func (t *BasicAuth) RoundTrip(r *http.Request) (*http.Response, error) {
	if r.Header.Get("Authorization") != "" {
		return t.base().RoundTrip(r)
	}
	req := cloneRequest(r)
	req.SetBasicAuth(t.Username, t.Password)
	return t.base().RoundTrip(req)
}

func (t *BasicAuth) base() http.RoundTripper {
	if t.Base != nil {
		return t.Base
	}
	return http.DefaultTransport
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
