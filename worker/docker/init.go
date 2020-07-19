package docker

import "github.com/bleenco/abstruse/worker/config"

var (
	cfg *config.Registry
)

// Init initializes global variables
func Init(config *config.Registry) {
	cfg = config
}
