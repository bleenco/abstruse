package version

// APIVersion represents current version of ractol API
const APIVersion = "0.0.0"

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
}

// GetBuildInfo returns build information
func GetBuildInfo() BuildInfo {
	return BuildInfo{
		GitCommit,
		APIVersion,
		UIVersion,
		BuildDate,
	}
}

// GenerateBuildVersionString returns string for CLI --version output
func GenerateBuildVersionString() string {
	versionString := "API version " + APIVersion + "\n" +
		"UI version  " + UIVersion + "\n" +
		"Commit      " + GitCommit + "\n" +
		"Date        " + BuildDate

	return versionString
}
