package docker

import (
	"bufio"
	"context"
	"fmt"

	"github.com/bleenco/abstruse/utils"
	grpc "github.com/bleenco/abstruse/worker/client"
	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
)

// RunContainer runs container.
func RunContainer(name string) error {
	ctx := context.Background()
	cli, err := client.NewEnvClient()
	if err != nil {
		return err
	}

	resp, err := cli.ContainerCreate(ctx, &container.Config{
		Image: "test-worker",
		// Cmd:   []string{"echo", "hello world"},
		Cmd: []string{"git", "clone", "https://github.com/jkuri/d3-bundle", "--depth", "1"},
		// Cmd: []string{"sh"},
		Tty: true,
	}, nil, nil, name)
	if err != nil {
		return err
	}

	if err := cli.ContainerStart(ctx, resp.ID, types.ContainerStartOptions{}); err != nil {
		return err
	}

	go func() {
		reader, err := cli.ContainerLogs(ctx, resp.ID, types.ContainerLogsOptions{
			ShowStdout: true,
			ShowStderr: true,
			Follow:     true,
			Timestamps: false,
		})
		if err != nil {
			return
		}
		defer reader.Close()

		scanner := bufio.NewScanner(reader)
		for scanner.Scan() {
			fmt.Println(scanner.Text())
		}
	}()

	code, err := cli.ContainerWait(ctx, resp.ID)
	if err != nil {
		return err
	}

	fmt.Println(code)

	return cli.ContainerRemove(ctx, resp.ID, types.ContainerRemoveOptions{Force: false})
}

func TestContainer(name string) error {
	cli, err := GetClient()
	if err != nil {
		return err
	}

	commands := [][]string{
		[]string{"git", "clone", "https://github.com/jkuri/d3-bundle", "--depth", "1"},
		[]string{"ls", "-alh"},
	}

	resp, err := CreateContainer(cli, name, "test-worker", []string{"/bin/sh"})
	if err != nil {
		return err
	}

	containerID := resp.ID

	for _, command := range commands {
		if !IsContainerRunning(cli, containerID) {
			if err := StartContainer(cli, containerID); err != nil {
				return err
			}
		}

		conn, execID, err := Exec(cli, containerID, command)
		if err != nil {
			return err
		}

		if _, err := grpc.Client.StreamContainerOutput(context.Background(), conn, containerID); err != nil {
			return err
		}

		inspect, err := cli.ContainerExecInspect(context.Background(), execID)
		if err != nil {
			return err
		}

		fmt.Printf("Exit code: %d\n", inspect.ExitCode)
	}

	return cli.ContainerRemove(context.Background(), containerID, types.ContainerRemoveOptions{Force: true})
}

// Exec executes specified command inside Docker container.
func Exec(cli *client.Client, id string, cmd []string) (types.HijackedResponse, string, error) {
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
func RemoveContainer(cli *client.Client, id string, force bool) error {
	return cli.ContainerRemove(context.Background(), id, types.ContainerRemoveOptions{Force: force})
}

// WaitContainer waits container to finish running and return exit status code.
func WaitContainer(cli *client.Client, id string) (int64, error) {
	return cli.ContainerWait(context.Background(), id)
}

// StartContainer starts Docker container.
func StartContainer(cli *client.Client, id string) error {
	return cli.ContainerStart(context.Background(), id, types.ContainerStartOptions{})
}

// CreateContainer creates new Docker container.
func CreateContainer(cli *client.Client, name, image string, cmd []string) (container.ContainerCreateCreatedBody, error) {
	return cli.ContainerCreate(context.Background(), &container.Config{
		Image: image,
		Cmd:   cmd,
		Tty:   true,
	}, nil, nil, name)
}

// IsContainerRunning returns true if container is running.
func IsContainerRunning(cli *client.Client, id string) bool {
	containers, err := ListRunningContainers(cli)
	if err != nil {
		return false
	}

	return utils.Include(containers, id)
}

// ListRunningContainers returns list of running containers.
func ListRunningContainers(cli *client.Client) ([]string, error) {
	var names []string

	containers, err := cli.ContainerList(context.Background(), types.ContainerListOptions{})
	if err != nil {
		return names, err
	}

	for _, container := range containers {
		data, err := InspectContainer(cli, container.ID)
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
func InspectContainer(cli *client.Client, id string) (types.ContainerJSON, error) {
	return cli.ContainerInspect(context.Background(), id)
}

// GetClient init new Docker client and returns it.
func GetClient() (*client.Client, error) {
	return client.NewEnvClient()
}
