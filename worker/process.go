package worker

import (
	"context"
	"strings"

	pb "github.com/bleenco/abstruse/proto"
	"github.com/bleenco/abstruse/worker/docker"
	"github.com/docker/docker/api/types"
)

// StartJob starts job task.
func StartJob(task *pb.JobTask) error {
	name := task.GetName()
	cli, err := docker.GetClient()
	if err != nil {
		return err
	}

	var commands [][]string

	for _, taskcmd := range task.GetCommands() {
		splitted := strings.Split(taskcmd, " ")
		commands = append(commands, splitted)
	}

	resp, err := docker.CreateContainer(cli, name, "test-worker", []string{"/bin/sh"})
	if err != nil {
		return err
	}

	containerID := resp.ID

	if err := SendRunningStatus(name); err != nil {
		return err
	}

	var exitCode int

	for _, command := range commands {
		if !docker.IsContainerRunning(cli, containerID) {
			if err := docker.StartContainer(cli, containerID); err != nil {
				return err
			}
		}

		conn, execID, err := docker.Exec(cli, containerID, command)
		if err != nil {
			return err
		}

		if err := Client.StreamContainerOutput(context.Background(), conn, containerID); err != nil {
			return err
		}

		inspect, err := cli.ContainerExecInspect(context.Background(), execID)
		if err != nil {
			return err
		}

		exitCode = inspect.ExitCode
	}

	if exitCode == 0 {
		if err := SendPassingStatus(name); err != nil {
			return err
		}
	} else {
		if err := SendFailingStatus(name); err != nil {
			return err
		}
	}

	return cli.ContainerRemove(context.Background(), containerID, types.ContainerRemoveOptions{Force: true})
}
