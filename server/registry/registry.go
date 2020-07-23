package registry

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httputil"
	"path"
	"strings"
	"time"

	"github.com/bleenco/abstruse/server/config"
	"github.com/docker/distribution/configuration"
	_ "github.com/docker/distribution/registry/auth/htpasswd" // htpasswd auth access controller.
	"github.com/docker/distribution/registry/handlers"
	_ "github.com/docker/distribution/registry/storage/driver/filesystem" // filesystem storage driver.
	log "github.com/sirupsen/logrus"
)

// Handler returns Docker image registry handler.
func Handler(cfg *config.Registry) http.Handler {
	ctx := context.Background()
	config := &configuration.Configuration{}
	config.Storage = map[string]configuration.Parameters{
		"filesystem": map[string]interface{}{"rootdirectory": cfg.DataDir},
		"cache": map[string]interface{}{
			"blobdescriptor": "inmemory",
		},
	}
	config.HTTP.Secret = "randpasswd"
	config.HTTP.Prefix = "/registry/"
	config.HTTP.RelativeURLs = true
	config.HTTP.DrainTimeout = time.Duration(10) * time.Second
	config.Auth = configuration.Auth{
		"htpasswd": configuration.Parameters{
			"realm": "abstruse",
			"path":  cfg.HTPasswd,
		},
	}
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
