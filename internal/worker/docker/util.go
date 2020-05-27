package docker

import "github.com/fatih/color"

func genExitMessage(code int) string {
	if code == 0 {
		green := color.New(color.FgGreen).SprintfFunc()
		return green("\n\nExit code: %d\n", code)
	}
	red := color.New(color.FgGreen).SprintfFunc()
	return red("\n\nExit code: %d\n", code)
}
