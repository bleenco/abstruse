package server

import (
	"net/http"

	"github.com/bleenco/abstruse/api"
	"github.com/julienschmidt/httprouter"
)

// APIVersion represents current version of bh-platform API
const APIVersion = "0.0.10"

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
	GitCommit  string `json:"git_commit"`
	APIVersion string `json:"api_version"`
	UIVersion  string `json:"ui_version"`
	BuildDate  string `json:"build_date"`
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

// FindVersionHandler => /api/version
func FindVersionHandler(res http.ResponseWriter, req *http.Request, ps httprouter.Params) {
	buildInfo := GetBuildInfo()
	api.JSONResponse(res, http.StatusOK, api.Response{Data: buildInfo})
}
