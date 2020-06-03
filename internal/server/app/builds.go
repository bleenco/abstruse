package app

import (
	"context"
	"strings"

	"github.com/jkuri/abstruse/internal/pkg/scm"
	"github.com/jkuri/abstruse/internal/server/db/model"
	"github.com/jkuri/abstruse/internal/server/parser"
	pb "github.com/jkuri/abstruse/proto"
	jsoniter "github.com/json-iterator/go"
)

// StartJob temp func.
func (app *App) StartJob() error {
	repoID, userID, ref := 1, 1, "8e1c6452d4"

	repo, err := app.repoRepository.Find(uint(repoID), uint(userID))
	if err != nil {
		return err
	}
	scm, err := scm.NewSCM(context.Background(), repo.Provider.Name, repo.Provider.URL, repo.Provider.AccessToken)
	if err != nil {
		return err
	}
	commit, err := scm.FindCommit(repo.FullName, ref)
	if err != nil {
		return err
	}
	// fmt.Printf("%+v\n", commit)
	content, err := scm.FindContent(repo.FullName, commit.Sha, ".abstruse.yml")
	if err != nil {
		return err
	}
	config := parser.ConfigParser{Raw: string(content.Data)}
	if err := config.Parse(); err != nil {
		return err
	}
	commandsJSON, err := jsoniter.Marshal(config.Commands)
	if err != nil {
		return err
	}
	// fmt.Printf("%v %v\n", config.Commands, config.Env)

	buildModel := model.Build{
		Branch:          "master",
		Commit:          commit.Sha,
		CommitMessage:   commit.Message,
		Config:          string(content.Data),
		AuthorLogin:     commit.Author.Login,
		AuthorName:      commit.Author.Name,
		AuthorEmail:     commit.Author.Email,
		AuthorAvatar:    commit.Author.Avatar,
		CommitterLogin:  commit.Committer.Name,
		CommitterName:   commit.Committer.Name,
		CommitterEmail:  commit.Committer.Email,
		CommitterAvatar: commit.Committer.Avatar,
		RepositoryID:    repo.ID,
	}
	build, err := app.buildRepository.Create(buildModel)
	if err != nil {
		return err
	}
	jobModel := model.Job{
		Image:    config.Parsed.Image,
		Commands: string(commandsJSON),
		Env:      strings.Join(config.Env, " "),
		BuildID:  build.ID,
	}
	job, err := app.jobRepository.Create(jobModel)
	if err != nil {
		return err
	}

	return app.scheduleJob(job)
}

func (app *App) scheduleJob(job model.Job) error {
	errch := make(chan error)

	go func() {
		var commands []string
		if err := jsoniter.UnmarshalFromString(job.Commands, &commands); err != nil {
			errch <- err
		}
		j := &Job{
			ID:      uint64(job.ID),
			BuildID: uint64(job.BuildID),
			Task: &pb.JobTask{
				Id:       uint64(job.ID),
				BuildId:  uint64(job.BuildID),
				Priority: 1000,
				Image:    "ubuntu_nvm",
				Commands: commands,
				Env:      strings.Split(job.Env, " "),
			},
		}
		app.Scheduler.ScheduleJobTask(j)
		errch <- nil
	}()

	return <-errch
}
