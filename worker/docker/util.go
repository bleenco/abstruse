package docker

import (
	"fmt"

	"github.com/logrusorgru/aurora"
)

func genExitMessage(code int) string {
	if code == 0 {
		return aurora.Bold(aurora.Green(fmt.Sprintf("\nExit code: %d", code))).String()
	}
	return aurora.Bold(aurora.Red(fmt.Sprintf("\nExit code: %d", code))).String()
}

func yellow(str string) string {
	return aurora.Bold(aurora.Yellow(str)).String()
}

func red(str string) string {
	return aurora.Bold(aurora.Red(str)).String()
}
