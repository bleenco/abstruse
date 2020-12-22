package parser

import (
	"fmt"

	"github.com/bleenco/abstruse/server/core"
)

// GenerateGlobalEnv generates global env variables.
func GenerateGlobalEnv(build *core.Build) []string {
	envs := make(map[string]string)

	envs["ABSTRUSE_REF"] = build.Ref
	envs["ABSTRUSE_BRANCH"] = build.Branch
	envs["ABSTRUSE_BUILD_ID"] = fmt.Sprintf("%d", build.ID)
	envs["ABSTRUSE_COMMIT"] = build.Commit

	if build.PR == 0 {
		envs["ABSTRUSE_PULL_REQUEST"] = "false"
	} else {
		envs["ABSTRUSE_PULL_REQUEST"] = "true"
	}

	return toSlice(envs)
}

func toSlice(envs map[string]string) []string {
	var result []string
	for key, val := range envs {
		result = append(result, fmt.Sprintf("%s=%s", key, val))
	}
	return result
}
