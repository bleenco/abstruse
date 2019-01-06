package httpfs

import (
	"log"
	"net/http"

	_ "github.com/bleenco/abstruse/server/statik" // static UI files
	"github.com/rakyll/statik/fs"
)

// StatikFS defines static HTTP file system.
var StatikFS http.FileSystem

func init() {
	statikFS, err := fs.New()
	if err != nil {
		log.Fatal(err)
	}

	StatikFS = statikFS
}
