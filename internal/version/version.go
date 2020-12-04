package version

import (
	"runtime"
	"strings"
)

// APIVersion represents current version of abstruse API
const APIVersion = "0.0.0-alpha.1"

var (
	// UIVersion is build time var and represents version of the user interface
	UIVersion string
	// GitCommit is build time var and represents curret git commit hash
	GitCommit string
	// BuildDate is build time var and represents build datetime
	BuildDate string
)

// BuildInfo defines build information
type BuildInfo struct {
	GitCommit  string `json:"commitHash"`
	APIVersion string `json:"api"`
	UIVersion  string `json:"ui"`
	BuildDate  string `json:"buildDate"`
	OS         string `json:"os"`
	Arch       string `json:"arch"`
}

// GetBuildInfo returns build information
func GetBuildInfo() BuildInfo {
	return BuildInfo{
		GitCommit,
		APIVersion,
		UIVersion,
		BuildDate,
		getOS(),
		getArch(),
	}
}

// GenerateBuildVersionString returns string for CLI --version output
func GenerateBuildVersionString() string {
	versionString := "API version " + APIVersion + "\n" +
		"UI version  " + UIVersion + "\n" +
		"Commit      " + GitCommit + "\n" +
		"Date        " + BuildDate + "\n" +
		"OS          " + getOS() + "\n" +
		"Arch        " + getArch()

	return versionString
}

func getOS() string {
	return strings.Title(strings.ToLower(runtime.GOOS))
}

func getArch() string {
	return runtime.GOARCH
}
