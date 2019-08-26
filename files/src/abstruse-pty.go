package main

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"regexp"
	"strconv"
	"strings"

	"github.com/creack/pty"
	"github.com/fatih/color"
	"github.com/bleenco/abstruse/pkg/constants"
	"mvdan.cc/sh/v3/syntax"
)

const (
	bashBin   = "/bin/bash"
	cmdSuffix = " && echo EXIT CODE $? || echo EXIT CODE $?"
)

func main() {
	args := os.Args[1:]

	if len(args) < 1 {
		fmt.Printf("Usage: %s cmd\n", os.Args[0])
		os.Exit(0)
	}

	commands := modifyCommands(strings.Split(strings.Join(args, " "), constants.CmdSeparator))

	if !commandExists(bashBin) {
		fmt.Printf("Error: %s does not exists\n", bashBin)
		os.Exit(255)
	}

	bash := exec.Command(bashBin)

	ptmx, err := pty.Start(bash)
	if err != nil {
		log.Fatal(err)
	}

	exeCh := make(chan int, len(commands)-1)
	exitCh := make(chan int)
	stdoutCh := make(chan string)

	go write(ptmx, commands, exeCh, exitCh)
	go read(ptmx, stdoutCh)
	go output(commands, stdoutCh, exeCh, exitCh)

	code := <-exitCh
	closePty(ptmx, code)

	os.Exit(code)
}

func read(file *os.File, stdoutCh chan<- string) {
	defer close(stdoutCh)

	for {
		buf := make([]byte, 1024)
		n, err := file.Read(buf)

		if err != nil {
			break
		}

		stdoutCh <- string(buf[:n])
	}
}

func write(file *os.File, commands []string, exeCh chan int, exitCh chan int) {
	defer func() {
		exitCh <- 0
	}()

	for {
		i, more := <-exeCh
		if more {
			run(commands[i], file)
		} else {
			break
		}
	}
}

func output(commands []string, stdoutCh chan string, exeCh chan int, exitCh chan int) {
	i, code := 0, 255
	var lastCmd string
	yellow := color.New(color.FgYellow).PrintfFunc()
	re := regexp.MustCompile(`^(.*)\:\~?\/(.*)\$\s`)
	redigit := regexp.MustCompile(`EXIT\sCODE\s(\d+)`)

	exeCh <- i

	for out := range stdoutCh {
		out = re.ReplaceAllString(out, "")

		for _, cmd := range commands {
			cmdc := strings.Replace(strings.TrimSpace(cmd), cmdSuffix, "", -1)
			if strings.Contains(out, cmdc) {
				if lastCmd != cmdc {
					lastCmd = cmdc
					yellow("=> %s\n", lastCmd)
				}
			}
		}

		if strings.Contains(out, "EXIT CODE") {
			if !strings.Contains(out, "EXIT CODE $?") {
				matches := redigit.FindStringSubmatch(out)
				if matches != nil {
					code, _ = strconv.Atoi(matches[1])
				}

				if code == 0 && i < len(commands)-1 {
					i++
					exeCh <- i
				} else {
					close(exeCh)
					exitCh <- code
				}
			}
			continue
		}

		fmt.Printf("%s", out)
	}
}

func run(cmd string, file *os.File) {
	reader := strings.NewReader(cmd)
	f, _ := syntax.NewParser().Parse(reader, "")

	printer := syntax.NewPrinter()
	printer.Print(file, f)
}

func closePty(file *os.File, exitCode int) {
	defer file.Close()

	if exitCode == 0 {
		green := color.New(color.FgGreen).PrintfFunc()
		green("\nThe command exited with 0.\n")
	} else {
		red := color.New(color.FgRed).PrintfFunc()
		red("\nThe command failed and exited with %d.\n", exitCode)
	}

	file.WriteString("exit " + strconv.Itoa(exitCode) + "\n")
}

func modifyCommands(commands []string) []string {
	var cmds []string
	for _, command := range commands {
		cmds = append(cmds, command+cmdSuffix)
	}
	return cmds
}

func commandExists(cmd string) bool {
	_, err := exec.LookPath(cmd)
	return err == nil
}
