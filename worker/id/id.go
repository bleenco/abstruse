package id

import (
	"crypto/md5"
	"fmt"
	"strings"

	"github.com/bleenco/abstruse/pkg/fs"
	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/worker/config"
)

// GenerateID generates workers id.
func GenerateID(cfg *config.Config) (string, error) {
	var id string
	addr := lib.GetListenAddress(cfg.GRPC.ListenAddr)
	cert, err := fs.ReadFile(cfg.TLS.Cert)
	if err != nil {
		return id, fmt.Errorf("could not read certificate file")
	}
	id = strings.ToUpper(New([]byte(fmt.Sprintf("%s-%s", cert, addr)))[0:6])
	return id, nil
}

// New generates a new md5 hash from given input bytes.
func New(data []byte) string {
	return fmt.Sprintf("%x", md5.Sum(data))
}
