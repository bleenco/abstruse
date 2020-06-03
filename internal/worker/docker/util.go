package docker

import "github.com/fatih/color"

func genExitMessage(code int) string {
	if code == 0 {
		green := color.New(color.FgGreen).SprintfFunc()
		return green("\nExit code: %d", code)
	}
	red := color.New(color.FgRed).SprintfFunc()
	return red("\nExit code: %d", code)
}
