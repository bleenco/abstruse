package app

import (
	"fmt"
	"os"
	"strings"

	"github.com/jkuri/abstruse/internal/core"
	"github.com/jkuri/abstruse/internal/pkg/fs"
	"github.com/jkuri/abstruse/internal/worker/docker"
	"github.com/jkuri/abstruse/internal/worker/git"
	pb "github.com/jkuri/abstruse/proto"
	jsoniter "github.com/json-iterator/go"
)

func (app *App) startJob(job core.Job) error {
	logch := make(chan []byte)

	name := fmt.Sprintf("abstruse-job-%d", job.ID)
	image := job.Image
	env := strings.Split(job.Env, " ")
	var cmds []string
	if err := jsoniter.UnmarshalFromString(job.Commands, &cmds); err != nil {
		return err
	}
	var commands [][]string
	for _, c := range cmds {
		commands = append(commands, strings.Split(c, " "))
	}

	dir, err := fs.TempDir()
	if err != nil {
		panic(err)
	}
	defer os.RemoveAll(dir)
	if err := git.CloneRepository(job.URL, job.Ref, job.CommitSHA, job.ProviderToken, dir); err != nil {
		panic(err)
	}

	go func(id, buildID uint) {
		for output := range logch {
			if stream, ok := app.api.logs[id]; ok {
				log := &pb.JobOutput{Id: uint64(id), BuildId: uint64(buildID), Content: output}
				if err := stream.Send(log); err != nil {
					return
				}
			}
		}
	}(job.ID, job.BuildID)

	if err := docker.RunContainer(name, image, commands, env, dir, logch); err != nil {
		app.logger.Error(err.Error())
		return err
	}
	return nil
}

func (app *App) stopJob(name string) error {
	return docker.StopContainer(name)
}
