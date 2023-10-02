package docker

import (
	"context"
	"fmt"
	"os"
	"path"
	"strings"

	api "github.com/bleenco/abstruse/pb"
	"github.com/bleenco/abstruse/pkg/fs"
	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/worker/cache"
	"github.com/bleenco/abstruse/worker/config"
	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/client"
	"github.com/dustin/go-humanize"
)

// RunContainer runs container.
func RunContainer(name, image string, job *api.Job, config *config.Config, env []string, dir string, logch chan<- []byte) error {
	ctx := context.Background()
	cli, err := client.NewClientWithOpts()
	if err != nil {
		return err
	}
	defer close(logch)
	var shell string

	resp, err := createContainer(cli, name, image, dir, []string{"/bin/bash"}, env, job.GetMount(), job.Platform)
	if err != nil {
		logch <- []byte(fmt.Sprintf("%s\r\n", err.Error()))
		return err
	}
	if !isContainerRunning(cli, resp.ID) {
		if err := startContainer(cli, resp.ID); err != nil {
			resp, err = createContainer(cli, name, image, dir, []string{"/bin/sh"}, env, job.GetMount(), job.Platform)
			if err != nil {
				logch <- []byte(fmt.Sprintf("%s\r\n", err.Error()))
				return err
			}
			shell = "sh"
		} else {
			shell = "bash"
		}
	}
	defer cli.ContainerRemove(ctx, resp.ID, types.ContainerRemoveOptions{Force: true})

	logch <- []byte(yellow("==> Starting build...\r\n"))

	exitCode := 0
	containerID := resp.ID

	job.Cache = lib.DeleteEmpty(job.GetCache())

	execCmd := func(command *api.Command) (string, error) {
		cmd := strings.Split(command.GetCommand(), " ")
		str := yellow("\r==> " + strings.Join(cmd, " ") + "\r\n")
		logch <- []byte(str)
		shcmd := []string{shell, "-ci", strings.Join(cmd, " ")}
		conn, execID, err := exec(cli, containerID, shcmd, env)
		if err != nil {
			logch <- []byte(fmt.Sprintf("%s\r\n", err.Error()))
			return "", err
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
		return execID, nil
	}

	var commands []*api.Command
	var failureCmd, successCmd *api.Command = nil, nil
	for _, command := range job.GetCommands() {
		if command.GetType() == api.Command_AfterFailure {
			failureCmd = command
			continue
		}
		if command.GetType() == api.Command_AfterSuccess {
			successCmd = command
			continue
		}
		commands = append(commands, command)
	}

	var cacheIndex int
	for i, command := range commands {
		if command.GetType() == api.Command_Install || command.GetType() == api.Command_Script {
			cacheIndex = i
		}
	}

	for i, command := range commands {
		if !isContainerRunning(cli, containerID) {
			if err := startContainer(cli, containerID); err != nil {
				logch <- []byte(fmt.Sprintf("%s\r\n", err.Error()))
				return err
			}
		}

		// restore cache.
		if i == 0 && len(job.GetCache()) > 0 {
			logch <- []byte(yellow("\r==> Downloading and restoring cache... "))
			cacheFile, err := cache.DownloadCache(config, job, dir)
			if err != nil {
				logch <- []byte(yellow(fmt.Sprintf("%s\r\n", err.Error())))
			} else {
				logch <- []byte(yellow("done\r\n"))
				os.RemoveAll(cacheFile)
			}
		}

		execID, err := execCmd(command)
		if err != nil {
			logch <- []byte(fmt.Sprintf("%s\r\n", err.Error()))
			return err
		}

		inspect, err := cli.ContainerExecInspect(ctx, execID)
		if err != nil {
			logch <- []byte(fmt.Sprintf("%s\r\n", err.Error()))
			return err
		}

		exitCode = inspect.ExitCode
		if exitCode != 0 {
			if failureCmd != nil {
				logch <- []byte(red("==> Starting after_failure script...\n"))
				if _, err := execCmd(failureCmd); err != nil {
					logch <- []byte(fmt.Sprintf("%s\r\n", err.Error()))
				}
			}
			break
		}

		// save cache.
		if i == cacheIndex && len(job.GetCache()) > 0 {
			logch <- []byte(yellow("\r==> Saving cache... "))
			cacheFile, err := cache.SaveCache(job, dir)

			if err != nil {
				logch <- []byte(yellow(fmt.Sprintf("%s\r\n", err.Error())))
			} else {
				info, err := os.Stat(cacheFile)
				if err != nil {
					return err
				}

				logch <- []byte(yellow("done\r\n"))
				logch <- []byte(yellow(fmt.Sprintf("\r==> Uploading cache (%s) to abstruse server... ", humanize.Bytes(uint64(info.Size())))))
				if err := cache.UploadCache(config, cacheFile); err != nil {
					logch <- []byte(yellow(fmt.Sprintf("%s\r\n", err.Error())))
				} else {
					logch <- []byte(yellow("done\r\n"))
				}

				os.RemoveAll(cacheFile)
			}
		}
	}

	logch <- []byte(genExitMessage(exitCode))
	if exitCode == 0 {
		if successCmd != nil {
			logch <- []byte(green("\r==> Starting after_success script...\r\n"))
			if _, err := execCmd(successCmd); err != nil {
				logch <- []byte(red(err.Error()))
			}
		}
		return nil
	}
	return fmt.Errorf("errored: %d", exitCode)
}

// StopContainer stops the container.
func StopContainer(name string) error {
	cli, err := client.NewClientWithOpts()
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

	conn, err = cli.ContainerExecAttach(ctx, exec.ID, types.ExecStartCheck{
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
	cli, _ := client.NewClientWithOpts()

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

// StartContainer starts Docker container.
func startContainer(cli *client.Client, id string) error {
	return cli.ContainerStart(context.Background(), id, types.ContainerStartOptions{})
}

// CreateContainer creates new Docker container.
func createContainer(cli *client.Client, name, image, dir string, cmd []string, env []string, mountdir []string, platform string) (container.ContainerCreateCreatedBody, error) {
	if id, exists := ContainerExists(name); exists {
		if err := cli.ContainerRemove(context.Background(), id, types.ContainerRemoveOptions{Force: true}); err != nil {
			return container.ContainerCreateCreatedBody{}, err
		}
	}

	mounts := []mount.Mount{
		{Type: mount.TypeBind, Source: path.Join(dir), Target: "/build"},
	}
	for i := range mountdir {
		m := strings.Split(mountdir[i], ":")
		if len(m) != 2 || !fs.Exists(m[0]) {
			continue
		}
		mounts = append(mounts, mount.Mount{
			Type:   mount.TypeBind,
			Source: m[0],
			Target: m[1],
		})
	}

	p := getPlatform(platform)
	return cli.ContainerCreate(context.Background(), &container.Config{
		Image:      image,
		Cmd:        cmd,
		Tty:        true,
		Env:        env,
		WorkingDir: "/build",
	}, &container.HostConfig{
		Mounts: mounts,
	}, nil, &p, name)
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
	containers, err := cli.ContainerList(context.Background(), types.ContainerListOptions{All: true})
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

	containers, err := cli.ContainerList(context.Background(), types.ContainerListOptions{All: true})
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
