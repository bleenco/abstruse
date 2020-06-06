package app

import (
	"context"
	"fmt"
	"io/ioutil"
	"os"
	"path"
	"strings"

	"github.com/jkuri/abstruse/internal/pkg/scm"
	"github.com/jkuri/abstruse/internal/pkg/shared"
	"github.com/jkuri/abstruse/internal/worker/docker"
	jsoniter "github.com/json-iterator/go"
)

func (app *App) startJob(job shared.Job) error {
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

	dir, err := ioutil.TempDir("/tmp", "abstruse-build")
	if err != nil {
		panic(err)
	}
	defer os.RemoveAll(dir)
	scm, err := scm.NewSCM(context.Background(), job.ProviderName, job.ProviderURL, job.ProviderToken)
	if err != nil {
		panic(err)
	}
	contents, err := scm.ListContent(job.RepoName, job.CommitSHA, "/")
	if err != nil {
		panic(err)
	}
	for _, content := range contents {
		filePath := path.Join(dir, content.Path)
		if err := ioutil.WriteFile(filePath, content.Data, 0644); err != nil {
			panic(err)
		}
	}

	go func() {
		for output := range logch {
			fmt.Printf("%s\n", string(output))
		}
	}()

	if err := docker.RunContainer(name, image, commands, env, dir, logch); err != nil {
		app.logger.Error(err.Error())
		return err
	}
	return nil
}
