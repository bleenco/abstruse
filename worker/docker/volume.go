package docker

import (
	"context"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/filters"
	"github.com/docker/docker/api/types/volume"
	"github.com/docker/docker/client"
)

func createVolume(name string) types.Volume {
	if volume, ok := findVolume(name); ok {
		return *volume
	}
	cli, err := client.NewEnvClient()
	if err != nil {
		panic(err)
	}
	volume, err := cli.VolumeCreate(context.Background(), volume.VolumesCreateBody{Name: name})
	if err != nil {
		panic(err)
	}
	return volume
}

func removeVolume(name string) error {
	if volume, ok := findVolume(name); ok {
		cli, err := client.NewEnvClient()
		if err != nil {
			panic(err)
		}
		return cli.VolumeRemove(context.Background(), volume.Name, true)
	}
	return nil
}

func findVolume(name string) (*types.Volume, bool) {
	cli, err := client.NewEnvClient()
	if err != nil {
		panic(err)
	}
	resp, err := cli.VolumeList(context.Background(), filters.Args{})
	if err != nil {
		panic(err)
	}
	for _, volume := range resp.Volumes {
		if volume.Name == name {
			return volume, true
		}
	}
	return nil, false
}
