package app

import (
	"context"
	"strings"

	"github.com/golang/protobuf/ptypes"
	"github.com/jkuri/abstruse/internal/pkg/scm"
	"github.com/jkuri/abstruse/internal/server/db/model"
	"github.com/jkuri/abstruse/internal/server/parser"
	pb "github.com/jkuri/abstruse/proto"
	jsoniter "github.com/json-iterator/go"
)

// StartJob temp func.
func (app *App) StartJob() error {
	repoID, userID, ref := 1, 1, "fc17be7670"

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

	for _, env := range config.Env {
		jobModel := model.Job{
			Image:    config.Parsed.Image,
			Commands: string(commandsJSON),
			Env:      env,
			BuildID:  build.ID,
		}
		job, err := app.jobRepository.Create(jobModel)
		if err != nil {
			return err
		}
		if err := app.scheduleJob(job, repo.Provider, commit.Sha, repo.FullName); err != nil {
			return err
		}
	}

	return nil
}

func (app *App) scheduleJob(job model.Job, provider model.Provider, commitSHA, repo string) error {
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
				Id:          uint64(job.ID),
				BuildId:     uint64(job.BuildID),
				Priority:    1000,
				Image:       job.Image,
				Commands:    commands,
				Env:         strings.Split(job.Env, " "),
				Provider:    provider.Name,
				Url:         provider.URL,
				Credentials: provider.AccessToken,
				CommitSHA:   commitSHA,
				Repo:        repo,
			},
		}
		app.Scheduler.ScheduleJobTask(j)
		errch <- nil
	}()

	return <-errch
}

func (app *App) saveJob(job *Job) error {
	start, _ := ptypes.Timestamp(job.Task.StartTime)
	end, _ := ptypes.Timestamp(job.Task.EndTime)
	j := model.Job{
		ID:        uint(job.ID),
		BuildID:   uint(job.BuildID),
		Log:       strings.Join(job.Log, ""),
		Status:    job.Status,
		StartTime: &start,
		EndTime:   &end,
	}
	j, err := app.jobRepository.Update(j)
	return err
}
