package docker

import (
	"fmt"

	"github.com/logrusorgru/aurora"
)

func genExitMessage(code int) string {
	if code == 0 {
		return green(fmt.Sprintf("\nExit code: %d", code))
	}
	return red(fmt.Sprintf("\nExit code: %d", code))
}

func green(str string) string {
	return aurora.Bold(aurora.Green(str)).String()
}

func yellow(str string) string {
	return aurora.Bold(aurora.Yellow(str)).String()
}

func red(str string) string {
	return aurora.Bold(aurora.Red(str)).String()
}
