package auth

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	jwt "github.com/dgrijalva/jwt-go"
)

var (
	tokenCtxKey = &contextKey{"Token"}
	errorCtxKey = &contextKey{"Error"}
)

// JWTAuth is JWT authenticator that provides middleware handlers
// and encoding/decoding functions for JWT signing.
type JWTAuth struct {
	signKey interface{}
	signer  jwt.SigningMethod
	parser  *jwt.Parser
}

// NewJWTAuth creates new JWTAuth authenticator instance.
func NewJWTAuth(alg string) *JWTAuth {
	return &JWTAuth{
		signKey: []byte(JWTSecret),
		signer:  jwt.GetSigningMethod(alg),
		parser:  &jwt.Parser{},
	}
}

// GenerateTokenPair returns both an access token and a refresh token.
func (a *JWTAuth) GenerateTokenPair(userClaims UserClaims, refreshClaims RefreshClaims) (string, string, error) {
	user, err := a.CreateJWT(userClaims)
	if err != nil {
		return "", "", err
	}
	refresh, err := a.CreateRefreshJWT(refreshClaims)
	if err != nil {
		return "", "", err
	}
	return user, refresh, nil
}

// CreateJWT returns an access token for provided user claims.
func (a *JWTAuth) CreateJWT(c UserClaims) (string, error) {
	c.IssuedAt = time.Now().Unix()
	c.ExpiresAt = time.Now().Add(JWTExpiry).Unix()
	c.Issuer = "Ractol CI"
	_, tokenString, err := a.encode(c)
	return tokenString, err
}

// CreateRefreshJWT returns a refresh token for provided token claims.
func (a *JWTAuth) CreateRefreshJWT(c RefreshClaims) (string, error) {
	c.IssuedAt = time.Now().Unix()
	c.ExpiresAt = time.Now().Add(JWTRefreshExpiry).Unix()
	c.Issuer = "Ractol CI"
	_, tokenString, err := a.encode(c)
	return tokenString, err
}

// Verifier http middleware handler will verify a JWT string from a http request.
func (a *JWTAuth) Verifier() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return a.verify(tokenFromQuery, tokenFromHeader, tokenFromCookie)(next)
	}
}

func (a *JWTAuth) verify(findTokenFns ...func(r *http.Request) string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		fn := func(w http.ResponseWriter, r *http.Request) {
			ctx := r.Context()
			token, err := a.verifyRequest(r, findTokenFns...)
			ctx = newContext(ctx, token, err)
			next.ServeHTTP(w, r.WithContext(ctx))
		}
		return http.HandlerFunc(fn)
	}
}

func (a *JWTAuth) verifyRequest(r *http.Request, findTokenFns ...func(r *http.Request) string) (*jwt.Token, error) {
	var token string
	var err error

	for _, fn := range findTokenFns {
		token = fn(r)
		if token != "" {
			break
		}
	}
	if token == "" {
		return nil, fmt.Errorf("token not found")
	}

	t, err := a.decode(token)
	if err != nil {
		if verr, ok := err.(*jwt.ValidationError); ok {
			if verr.Errors&jwt.ValidationErrorExpired > 0 {
				return t, fmt.Errorf("token is expired")
			} else if verr.Errors&jwt.ValidationErrorIssuedAt > 0 {
				return t, fmt.Errorf("token iat validation failed")
			} else if verr.Errors&jwt.ValidationErrorNotValidYet > 0 {
				return t, fmt.Errorf("token nbf validation failed")
			}
		}
		return t, err
	}

	if t == nil || !t.Valid {
		err = fmt.Errorf("token is unathorized")
		return t, err
	}

	if t.Method != a.signer {
		return t, fmt.Errorf("token signing method is invalid")
	}

	return t, nil
}

func (a *JWTAuth) encode(claims jwt.Claims) (t *jwt.Token, tokenString string, err error) {
	t = jwt.New(a.signer)
	t.Claims = claims
	tokenString, err = t.SignedString(a.signKey)
	t.Raw = tokenString
	return
}

func (a *JWTAuth) decode(tokenString string) (*jwt.Token, error) {
	return a.parser.Parse(tokenString, a.keyFunc)
}

func (a *JWTAuth) keyFunc(t *jwt.Token) (interface{}, error) {
	return a.signKey, nil
}

func newContext(ctx context.Context, t *jwt.Token, err error) context.Context {
	ctx = context.WithValue(ctx, tokenCtxKey, t)
	ctx = context.WithValue(ctx, errorCtxKey, err)
	return ctx
}

// FromContext returns token from context.
func FromContext(ctx context.Context) (*jwt.Token, jwt.MapClaims, error) {
	token, _ := ctx.Value(tokenCtxKey).(*jwt.Token)

	var claims jwt.MapClaims
	if token != nil {
		if tokenClaims, ok := token.Claims.(jwt.MapClaims); ok {
			claims = tokenClaims
		} else {
			panic(fmt.Sprintf("jwtauth: unknown type of Claims: %T", token.Claims))
		}
	} else {
		claims = jwt.MapClaims{}
	}

	err, _ := ctx.Value(errorCtxKey).(error)

	return token, claims, err
}

func tokenFromCookie(r *http.Request) string {
	cookie, err := r.Cookie("jwt")
	if err != nil {
		return ""
	}
	return cookie.Value
}

func tokenFromHeader(r *http.Request) string {
	bearer := r.Header.Get("Authorization")
	if len(bearer) > 7 && strings.ToLower(bearer[0:6]) == "bearer" {
		return bearer[7:]
	}
	return ""
}

func tokenFromQuery(r *http.Request) string {
	return r.URL.Query().Get("jwt")
}

type contextKey struct {
	name string
}

func (k *contextKey) String() string {
	return "jwtauth context value " + k.name
}
