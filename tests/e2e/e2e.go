package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"syscall"
	"time"
)

var (
	exitCode  = 255
	cwd       string
	processes []*os.Process
)

func main() {
	var err error

	cwd, err = os.Getwd()
	if err != nil {
		goto exit
	}

	fmt.Printf("running test in %s...\n", cwd)

	if exitCode = execute("make"); exitCode != 0 {
		goto exit
	}

	if exitCode = startContainers(); exitCode != 0 {
		goto exit
	}

	if err = startRactol(); err != nil {
		exitCode = 1
		goto exit
	}

	if exitCode = tests(); exitCode != 0 {
		goto exit
	}

exit:
	if ret := stopContainers(); ret != 0 {
		fmt.Printf("error stopping containers\n")
	}
	killProcesses()

	fmt.Printf("\ntest exited with code %d\n", exitCode)
	os.Exit(exitCode)
}

func tests() int {
	path, err := exec.LookPath("bash")
	if err != nil {
		return 255
	}

	cmd := exec.Command(path, "-ci", "npm run e2e:ci")
	cmd.Dir = filepath.Join(cwd, "web", "ractol")
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

func startRactol() error {
	cmd := exec.Command("./build/ractol-server", "--config", "./configs/testing/ractol-server.json")
	if err := cmd.Start(); err != nil {
		return err
	}
	processes = append(processes, cmd.Process)

	return nil
}

func startContainers() int {
	if ret := execute("docker-compose", "-f", "./configs/testing/docker-compose.yml", "up", "-d"); ret != 0 {
		return ret
	}

	if err := waitTCP(time.Second*60, 33306); err != nil {
		return 255
	}

	return 0
}

func stopContainers() int {
	return execute("docker-compose", "-f", "./configs/testing/docker-compose.yml", "down", "-t", "5")
}

func execute(command string, arg ...string) int {
	fmt.Printf("executing %s %s...\n", command, arg)

	cmd := exec.Command(command, arg...)
	cmd.Dir = cwd

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

func killProcesses() {
	for _, process := range processes {
		process.Kill()
	}
}
