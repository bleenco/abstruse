package registry

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httputil"
	"path"
	"strings"

	"github.com/docker/distribution/configuration"
	"github.com/docker/distribution/registry/handlers"
	_ "github.com/docker/distribution/registry/storage/driver/filesystem" // filesystem storage driver.
	log "github.com/sirupsen/logrus"
)

// Handler returns Docker image registry handler.
func Handler() http.Handler {
	ctx := context.Background()
	config := &configuration.Configuration{}
	config.Storage = map[string]configuration.Parameters{"filesystem": map[string]interface{}{"rootdirectory": "/Users/jan/abstruse/registry"}}
	config.HTTP.Secret = "randpasswd"
	config.HTTP.Prefix = "/registry/"
	config.HTTP.RelativeURLs = true
	log.SetLevel(logLevel("panic"))

	return panicHandler(handlers.NewApp(ctx, config))
}

// Proxy proxies requests from /v2/ => /registry/v2/
func Proxy(w http.ResponseWriter, r *http.Request) {
	p := httputil.ReverseProxy{Director: func(req *http.Request) {
		urlPath := r.URL.Path
		req.URL.Path = path.Clean(fmt.Sprintf("%s/%s/", "/registry", urlPath))
		if strings.HasSuffix(urlPath, "/") {
			req.URL.Path = fmt.Sprintf("%s/", req.URL.Path)
		}

		req.URL.Scheme = "http"
		req.URL.Host = r.Host
		req.Host = r.Host
	}}
	p.ServeHTTP(w, r)
}

func alive(path string, handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == path {
			w.Header().Set("Cache-Control", "no-cache")
			w.WriteHeader(http.StatusOK)
			return
		}

		handler.ServeHTTP(w, r)
	})
}

func panicHandler(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				log.Panic(fmt.Sprintf("%v", err))
			}
		}()
		handler.ServeHTTP(w, r)
	})
}

func logLevel(level configuration.Loglevel) log.Level {
	l, err := log.ParseLevel(string(level))
	if err != nil {
		l = log.InfoLevel
		log.Warnf("error parsing level %q: %v, using %q	", level, err, l)
	}

	return l
}
