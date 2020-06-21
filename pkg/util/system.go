package util

import (
	"github.com/jkuri/abstruse/pkg/fs"
)

// IsInContainer returns true if worker process is running inside Docker container.
func IsInContainer() bool {
	return fs.Exists("/.dockerenv")
}

// IsDockerRunning returns true if Docker on host system is running.
func IsDockerRunning() bool {
	return fs.Exists("/var/run/docker.sock")
}
