package worker

import (
	"context"
	"fmt"
	"io"
	"os"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
)

// RunContainer runs container.
func RunContainer() error {
	ctx := context.Background()
	cli, err := client.NewEnvClient()
	if err != nil {
		return err
	}

	resp, err := cli.ContainerCreate(ctx, &container.Config{
		Image: "test-worker",
		Cmd:   []string{"echo", "hello world"},
		Tty:   true,
	}, nil, nil, "")
	if err != nil {
		return err
	}

	if err := cli.ContainerStart(ctx, resp.ID, types.ContainerStartOptions{}); err != nil {
		return err
	}

	code, err := cli.ContainerWait(ctx, resp.ID)
	if err != nil {
		return err
	}

	fmt.Println(code)

	out, err := cli.ContainerLogs(ctx, resp.ID, types.ContainerLogsOptions{ShowStdout: true})
	if err != nil {
		return err
	}

	io.Copy(os.Stdout, out)

	return cli.ContainerRemove(ctx, resp.ID, types.ContainerRemoveOptions{Force: false})
}
