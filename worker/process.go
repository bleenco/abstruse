package worker

import (
	"context"
	"fmt"

	pb "github.com/bleenco/abstruse/proto"
	"github.com/bleenco/abstruse/worker/docker"
	"github.com/docker/docker/api/types"
)

// StartJob adds job task to the
func StartJob(task *pb.JobTask) error {
	if err := TestContainer(task.GetName()); err != nil {
		fmt.Println(err)
		return err
	}
	return nil
}

func TestContainer(name string) error {
	cli, err := docker.GetClient()
	if err != nil {
		return err
	}

	commands := [][]string{
		[]string{"git", "clone", "https://github.com/jkuri/d3-bundle", "--depth", "1"},
		[]string{"ls", "-alh"},
	}

	resp, err := docker.CreateContainer(cli, name, "test-worker", []string{"/bin/sh"})
	if err != nil {
		return err
	}

	containerID := resp.ID

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

		fmt.Printf("Exit code: %d\n", inspect.ExitCode)
	}

	return cli.ContainerRemove(context.Background(), containerID, types.ContainerRemoveOptions{Force: true})
}
