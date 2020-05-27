package docker

import (
	"context"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/fatih/color"
	"github.com/jkuri/abstruse/internal/pkg/util"
)

// RunContainer runs container.
func RunContainer(name string, commands [][]string, logch chan<- []byte) error {
	ctx := context.Background()
	cli, err := client.NewEnvClient()
	if err != nil {
		return err
	}
	defer close(logch)

	resp, err := createContainer(cli, name, "ubuntu:20.04", []string{"/bin/bash"})
	if err != nil {
		return err
	}

	exitCode := 0
	containerID := resp.ID

	for _, command := range commands {
		if !isContainerRunning(cli, containerID) {
			if err := startContainer(cli, containerID); err != nil {
				return err
			}
		}

		conn, execID, err := exec(cli, containerID, command)
		if err != nil {
			return err
		}

		for {
			buf := make([]byte, 4096)
			n, err := conn.Reader.Read(buf)
			if err != nil {
				conn.Close()
				break
			}
			logch <- buf[:n]
		}

		inspect, err := cli.ContainerExecInspect(ctx, execID)
		if err != nil {
			return err
		}
		exitCode = inspect.ExitCode

		if exitCode != 0 {
			break
		}
	}

	var exitMessage string
	switch exitCode {
	case 0:
		green := color.New(color.FgGreen).SprintfFunc()
		exitMessage = green("\n\nExit code: %d\n", exitCode)
	default:
		red := color.New(color.FgGreen).SprintfFunc()
		exitMessage = red("\n\nExit code: %d\n", exitCode)
	}
	logch <- []byte(exitMessage)

	return cli.ContainerRemove(ctx, resp.ID, types.ContainerRemoveOptions{Force: true})
}

// Exec executes specified command inside Docker container.
func exec(cli *client.Client, id string, cmd []string) (types.HijackedResponse, string, error) {
	var conn types.HijackedResponse

	ctx := context.Background()
	exec, err := cli.ContainerExecCreate(ctx, id, types.ExecConfig{
		AttachStderr: true,
		AttachStdin:  false,
		AttachStdout: true,
		Cmd:          cmd,
		Tty:          true,
		Detach:       false,
	})
	if err != nil {
		return conn, "", err
	}

	conn, err = cli.ContainerExecAttach(ctx, exec.ID, types.ExecConfig{
		Detach: false,
		Tty:    true,
	})
	if err != nil {
		return conn, "", err
	}

	return conn, exec.ID, nil
}

// RemoveContainer removes Docker container.
func removeContainer(cli *client.Client, id string, force bool) error {
	return cli.ContainerRemove(context.Background(), id, types.ContainerRemoveOptions{Force: force})
}

// WaitContainer waits container to finish running and return exit status code.
func waitContainer(cli *client.Client, id string) (int64, error) {
	return cli.ContainerWait(context.Background(), id)
}

// StartContainer starts Docker container.
func startContainer(cli *client.Client, id string) error {
	return cli.ContainerStart(context.Background(), id, types.ContainerStartOptions{})
}

// CreateContainer creates new Docker container.
func createContainer(cli *client.Client, name, image string, cmd []string) (container.ContainerCreateCreatedBody, error) {
	return cli.ContainerCreate(context.Background(), &container.Config{
		Image: image,
		Cmd:   cmd,
		Tty:   true,
	}, nil, nil, name)
}

// IsContainerRunning returns true if container is running.
func isContainerRunning(cli *client.Client, id string) bool {
	containers, err := ListRunningContainers(cli)
	if err != nil {
		return false
	}

	return util.Include(containers, id)
}

// ListRunningContainers returns list of running containers.
func ListRunningContainers(cli *client.Client) ([]string, error) {
	var names []string

	containers, err := cli.ContainerList(context.Background(), types.ContainerListOptions{})
	if err != nil {
		return names, err
	}

	for _, container := range containers {
		data, err := inspectContainer(cli, container.ID)
		if err != nil {
			return names, nil
		}

		if data.State.Running {
			names = append(names, container.ID)
		}
	}

	return names, nil
}

// InspectContainer returns information about container.
func inspectContainer(cli *client.Client, id string) (types.ContainerJSON, error) {
	return cli.ContainerInspect(context.Background(), id)
}
