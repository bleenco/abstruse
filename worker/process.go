package worker

import (
	"context"
	"strings"

	"github.com/bleenco/abstruse/pkg/constants"
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

	var commands []string

	for _, taskcmd := range task.GetCommands() {
		commands = append(commands, taskcmd)
	}

	commands = strings.Split(strings.Join(commands, constants.CmdSeparator), " ")

	resp, err := docker.CreateContainer(cli, name, task.GetImage(), task.GetEnv())
	if err != nil {
		return err
	}

	data, err := docker.InspectContainer(cli, resp.ID)
	if err != nil {
		return err
	}
	containerID := data.ID

	if err := SendRunningStatus(containerID, name); err != nil {
		return err
	}

	ctx := context.Background()
	var exitCode int

	if !docker.IsContainerRunning(cli, containerID) {
		if err := docker.StartContainer(cli, containerID); err != nil {
			return err
		}
	}

	conn, execID, err := docker.Exec(cli, containerID, append([]string{"abstruse-pty"}, commands...))
	if err != nil {
		return err
	}

	if err := Client.StreamContainerOutput(ctx, conn, containerID, name); err != nil {
		return err
	}

	inspect, err := cli.ContainerExecInspect(ctx, execID)
	if err != nil {
		return err
	}

	exitCode = inspect.ExitCode

	if exitCode == 0 {
		if err := SendPassingStatus(containerID, name); err != nil {
			return err
		}
	} else if exitCode == 137 {
		if err := SendStoppedStatus(containerID, name); err != nil {
			return err
		}
	} else {
		if err := SendFailingStatus(containerID, name); err != nil {
			return err
		}
	}

	return cli.ContainerRemove(ctx, containerID, types.ContainerRemoveOptions{Force: true})
}

// StopJob stops job task.
func StopJob(containerID string) error {
	cli, err := docker.GetClient()
	if err != nil {
		return err
	}

	return cli.ContainerRemove(context.Background(), containerID, types.ContainerRemoveOptions{Force: true})
}
