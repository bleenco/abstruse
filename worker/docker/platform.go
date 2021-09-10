package docker

import (
	"runtime"
	"strings"

	v1 "github.com/opencontainers/image-spec/specs-go/v1"
)

func getPlatform(platform string) v1.Platform {
	s := strings.Split(platform, "/")
	if len(s) == 2 {
		return v1.Platform{
			OS:           s[0],
			Architecture: s[1],
		}
	}
	if len(s) == 3 {
		return v1.Platform{
			OS:           s[0],
			Architecture: s[1],
			Variant:      s[2],
		}
	}
	return v1.Platform{
		OS:           runtime.GOOS,
		Architecture: runtime.GOARCH,
	}
}
