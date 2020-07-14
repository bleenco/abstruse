package main

import (
	"os"
	"os/exec"
	"strings"
	"syscall"
)

func run(command []string) int {
	path, err := exec.LookPath("bash")
	if err != nil {
		path, err = exec.LookPath("sh")
	}
	cmd := exec.Command(path, "-ci", strings.Join(command, " "))
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	var waitStatus syscall.WaitStatus
	if err := cmd.Run(); err != nil {
		if exitError, ok := err.(*exec.ExitError); ok {
			waitStatus = exitError.Sys().(syscall.WaitStatus)
		}
	} else {
		waitStatus = cmd.ProcessState.Sys().(syscall.WaitStatus)
	}
	return waitStatus.ExitStatus()
}

func main() {
	os.Exit(run(os.Args[1:]))
}
