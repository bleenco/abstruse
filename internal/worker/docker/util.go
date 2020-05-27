package docker

import "github.com/fatih/color"

func genExitMessage(code int) string {
	var msg string
	if code == 0 {
		green := color.New(color.FgGreen).SprintfFunc()
		msg = green("\n\nExit code: %d\n", code)
	} else {
		red := color.New(color.FgGreen).SprintfFunc()
		msg = red("\n\nExit code: %d\n", code)
	}
	return msg
}
