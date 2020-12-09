package docker

import (
	"context"
	"fmt"
	"path"
	"strings"

	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/client"
)

// RunContainer runs container.
func RunContainer(name, image string, commands [][]string, env []string, dir string, logch chan<- []byte) error {
	ctx := context.Background()
	cli, err := client.NewEnvClient()
	if err != nil {
		return err
	}
	defer close(logch)

	resp, err := createContainer(cli, name, image, dir, []string{"/bin/bash"}, env)
	if err != nil {
		logch <- []byte(err.Error())
		return err
	}
	if !isContainerRunning(cli, resp.ID) {
		if err := startContainer(cli, resp.ID); err != nil {
			resp, err = createContainer(cli, name, image, dir, []string{"/bin/sh"}, env)
			if err != nil {
				logch <- []byte(err.Error())
				return err
			}
		}
	}
	defer cli.ContainerRemove(ctx, resp.ID, types.ContainerRemoveOptions{Force: true})

	exitCode := 0
	containerID := resp.ID

	for _, command := range commands {
		if !isContainerRunning(cli, containerID) {
			if err := startContainer(cli, containerID); err != nil {
				logch <- []byte(err.Error())
				return err
			}
		}
		str := yellow("\r==> " + strings.Join(command, " ") + "\n\r")
		logch <- []byte(str)
		command = []string{"bash", "-ci", strings.Join(command, " ")}
		conn, execID, err := exec(cli, containerID, command, env)
		if err != nil {
			logch <- []byte(err.Error())
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
			logch <- []byte(err.Error())
			return err
		}
		exitCode = inspect.ExitCode
		if exitCode != 0 {
			break
		}
	}

	logch <- []byte(genExitMessage(exitCode))
	if exitCode == 0 {
		return nil
	}
	return fmt.Errorf("errored: %d", exitCode)
}

// StopContainer stops the container.
func StopContainer(name string) error {
	cli, err := client.NewEnvClient()
	if err != nil {
		return err
	}
	containerID, err := findContainer(cli, name)
	if err != nil {
		return err
	}
	return cli.ContainerRemove(context.Background(), containerID, types.ContainerRemoveOptions{Force: true})
}

// Exec executes specified command inside Docker container.
func exec(cli *client.Client, id string, cmd, env []string) (types.HijackedResponse, string, error) {
	var conn types.HijackedResponse

	ctx := context.Background()
	exec, err := cli.ContainerExecCreate(ctx, id, types.ExecConfig{
		AttachStderr: true,
		AttachStdin:  true,
		AttachStdout: true,
		Cmd:          cmd,
		Env:          env,
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

// ContainerExists finds container by name and if exists returns id.
func ContainerExists(name string) (string, bool) {
	cli, _ := client.NewEnvClient()

	containers, err := cli.ContainerList(context.Background(), types.ContainerListOptions{All: true})
	if err != nil {
		return "", false
	}
	for _, container := range containers {
		if lib.Include(container.Names, fmt.Sprintf("/%s", name)) {
			return container.ID, true
		}
	}
	return "", false
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
func createContainer(cli *client.Client, name, image, dir string, cmd []string, env []string) (container.ContainerCreateCreatedBody, error) {
	if id, exists := ContainerExists(name); exists {
		if err := cli.ContainerRemove(context.Background(), id, types.ContainerRemoveOptions{Force: true}); err != nil {
			return container.ContainerCreateCreatedBody{}, err
		}
	}

	mounts := []mount.Mount{
		{Type: mount.TypeBind, Source: path.Join(dir), Target: "/build"},
		{Type: mount.TypeBind, Source: "/var/run/docker.sock", Target: "/var/run/docker.sock"},
	}

	return cli.ContainerCreate(context.Background(), &container.Config{
		Image:      image,
		Cmd:        cmd,
		Tty:        true,
		Env:        env,
		WorkingDir: "/build",
	}, &container.HostConfig{
		Mounts: mounts,
	}, nil, name)
}

// IsContainerRunning returns true if container is running.
func isContainerRunning(cli *client.Client, id string) bool {
	containers, err := listRunningContainers(cli)
	if err != nil {
		return false
	}

	return lib.Include(containers, id)
}

func findContainer(cli *client.Client, name string) (string, error) {
	name = fmt.Sprintf("/%s", name)
	containers, err := cli.ContainerList(context.Background(), types.ContainerListOptions{})
	if err != nil {
		return "", err
	}
	for _, container := range containers {
		for _, n := range container.Names {
			if n == name {
				return container.ID, nil
			}
		}
	}
	return "", fmt.Errorf("container %s not found", name)
}

// ListRunningContainers returns list of running containers.
func listRunningContainers(cli *client.Client) ([]string, error) {
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
