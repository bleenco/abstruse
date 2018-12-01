package worker

import "context"

// Authentication holds the identifier/jwt token credentials.
type Authentication struct {
	Identifier string
	JWT        string
}

// GetRequestMetadata gets the current request metadata.
func (a *Authentication) GetRequestMetadata(context.Context, ...string) (map[string]string, error) {
	return map[string]string{
		"identifier": a.Identifier,
		"jwt":        a.JWT,
	}, nil
}

// RequireTransportSecurity indicates whether the credentials requires transport security.
func (a *Authentication) RequireTransportSecurity() bool {
	return true
}
