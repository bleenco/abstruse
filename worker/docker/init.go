package docker

import "github.com/bleenco/abstruse/worker/config"

var (
	cfg struct {
		registry *config.Registry
		host     *config.Docker
	}
)

// Init initializes global variables
func Init(config *config.Config) {
	cfg.registry = config.Registry
	cfg.host = config.Docker
}
