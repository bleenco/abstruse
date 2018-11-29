package server

import (
	"net/http"
	"os"
	"path"
)

type spaWrapper struct {
	assets http.FileSystem
}

func (s *spaWrapper) Open(name string) (http.File, error) {
	ret, err := s.assets.Open(name)
	if !os.IsNotExist(err) || path.Ext(name) != "" {
		return ret, err
	}

	return s.assets.Open("/index.html")
}
