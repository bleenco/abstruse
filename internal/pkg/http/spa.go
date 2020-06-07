package http

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path"
	"strconv"
	"strings"

	"github.com/jkuri/statik/fs"
)

type statikWrapper struct {
	assets http.FileSystem
}

// Open method.
func (sw *statikWrapper) Open(name string) (http.File, error) {
	ret, err := sw.assets.Open(name)
	if !os.IsNotExist(err) || path.Ext(name) != "" {
		return ret, err
	}

	return sw.assets.Open("/index.html")
}

func fileServer(root *fs.StatikFS) http.Handler {
	fs := http.FileServer(&statikWrapper{root})

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		url := r.URL.Path
		if !strings.HasPrefix(url, "/") {
			url = fmt.Sprintf("/%s", url)
		}
		if _, err := root.Open(url); err != nil && os.IsNotExist(err) {
			if pusher, ok := w.(http.Pusher); ok {
				for p, file := range root.Files {
					if !file.IsDir() && shouldPush(p) {
						if err := pusher.Push(p, nil); err != nil {
							log.Printf("could not push %s", url)
						}
					}
				}
			}
		}

		fs.ServeHTTP(w, r)
	})
}

func shouldPush(name string) bool {
	if path.Dir(name) != "/" {
		return false
	}
	if !strings.Contains(name, "es2015") && !strings.Contains(name, "styles") {
		return false
	}
	if _, err := strconv.Atoi(strings.Replace(strings.Split(name, "-")[0], "/", "", -1)); err == nil {
		return false
	}
	if path.Ext(name) != ".js" && path.Ext(name) != ".css" {
		return false
	}
	return true
}
