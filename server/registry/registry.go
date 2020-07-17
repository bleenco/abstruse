package registry

import (
	"context"
	"fmt"
	"net/http"

	"github.com/docker/distribution/configuration"
	"github.com/docker/distribution/health"
	"github.com/docker/distribution/registry/handlers"
	_ "github.com/docker/distribution/registry/storage/driver/filesystem" // filesystem storage driver.
	log "github.com/sirupsen/logrus"
)

// Handler returns Docker image registry handler.
func Handler() http.Handler {
	ctx := context.Background()
	config := &configuration.Configuration{}
	// config.Storage = map[string]configuration.Parameters{"filesystem": map[string]interface{}{
	// 	"rootdirectory": "/Users/jan/abstruse/registry",
	// }}
	config.Storage = configuration.Storage{"filesystem": configuration.Parameters{"rootdirectory": "/Users/jan/abstruse/registry"}}
	config.HTTP.Secret = "randpasswd"
	config.HTTP.Prefix = "/registry/"
	log.SetLevel(logLevel("debug"))

	app := handlers.NewApp(ctx, config)
	app.RegisterHealthChecks()
	handler := alive("/registry", app)
	handler = health.Handler(handler)
	handler = panicHandler(handler)

	return handler
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
