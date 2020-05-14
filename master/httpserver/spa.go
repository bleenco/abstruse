package httpserver

import (
	"net/http"
	"os"
	"path"
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
