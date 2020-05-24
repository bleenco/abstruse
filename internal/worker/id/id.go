package id

import (
	"crypto/md5"
	"fmt"
	"strings"

	"github.com/jkuri/abstruse/internal/pkg/certgen"
	"github.com/jkuri/abstruse/internal/pkg/fs"
	"github.com/jkuri/abstruse/internal/pkg/util"
	"github.com/jkuri/abstruse/internal/worker/options"
)

// GenerateID generates workers id.
func GenerateID(opts *options.Options) (string, error) {
	var id string
	addr := util.GetListenAddress(opts.GRPC.ListenAddr)
	if opts.Cert == "" || opts.Key == "" {
		return id, fmt.Errorf("cert and key must be specified")
	}
	if err := certgen.CheckAndGenerateCert(opts.Cert, opts.Key); err != nil {
		return id, err
	}
	cert, err := fs.ReadFile(opts.Cert)
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
