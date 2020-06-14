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
	logch := make(chan []byte, 1024)

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
		app.logger.Error(err.Error())
		return err
	}
	defer os.RemoveAll(dir)
	if err := git.CloneRepository(job.URL, job.Ref, job.CommitSHA, job.ProviderToken, dir); err != nil {
		app.logger.Error(err.Error())
		return err
	}

	go app.streamLog(logch, job)

	if err := docker.RunContainer(name, image, commands, env, dir, logch); err != nil {
		app.logger.Error(err.Error())
		return err
	}

	return nil
}

func (app *App) stopJob(name string) error {
	return docker.StopContainer(name)
}

func (app *App) streamLog(logch chan []byte, job core.Job) {
	for output := range logch {
		if stream, ok := app.api.logs[job.ID]; ok {
			log := &pb.JobOutput{Id: uint64(job.ID), BuildId: uint64(job.BuildID), Content: output}
			if err := stream.Send(log); err != nil {
				break
			}
		}
	}
	app.api.mu.Lock()
	defer app.api.mu.Unlock()
	delete(app.api.logs, job.ID)
}
