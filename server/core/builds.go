package core

import (
	"context"
	"encoding/json"
	"sync"
	"time"

	"github.com/bleenco/abstruse/internal/common"
	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/pkg/scm"
	"github.com/bleenco/abstruse/server/db/model"
	"github.com/bleenco/abstruse/server/parser"
)

// StartBuild temp func.
func (app *App) StartBuild(b common.Build) error {
	app.logBuild(b)
	repo, err := app.repo.Repo.FindByClone(b.RepoURL)
	if err != nil {
		return err
	}
	scm, err := scm.NewSCM(context.Background(), repo.Provider.Name, repo.Provider.URL, repo.Provider.AccessToken)
	if err != nil {
		return err
	}
	ref, err := scm.FindBranch(repo.FullName, b.Branch)
	if err != nil {
		return err
	}
	reference := ref.Path
	if b.PrNumber != 0 {
		reference = b.Ref
	}
	if b.CommitSHA == "" || (b.CommitMessage == "" && b.PrNumber == 0) {
		commit, err := scm.LastCommit(repo.FullName, b.Branch)
		if err != nil {
			return err
		}
		if b.CommitSHA == "" {
			b.CommitSHA = commit.Sha
		}
		if b.CommitMessage == "" {
			b.CommitMessage = commit.Message
		}
	}
	content, err := scm.FindContent(repo.FullName, b.CommitSHA, ".abstruse.yml")
	if err != nil {
		return err
	}
	config := parser.ConfigParser{Raw: string(content.Data)}
	if err := config.Parse(); err != nil {
		return err
	}
	commandsJSON, err := json.Marshal(config.Commands)
	if err != nil {
		return err
	}

	buildModel := model.Build{
		Branch:          b.Branch,
		Ref:             reference,
		Commit:          b.CommitSHA,
		CommitMessage:   b.CommitMessage,
		PR:              b.PrNumber,
		PRTitle:         b.PrTitle,
		Config:          string(content.Data),
		AuthorLogin:     b.AuthorLogin,
		AuthorName:      b.AuthorName,
		AuthorEmail:     b.AuthorEmail,
		AuthorAvatar:    b.AuthorAvatar,
		CommitterLogin:  b.SenderLogin,
		CommitterName:   b.SenderName,
		CommitterEmail:  b.SenderEmail,
		CommitterAvatar: b.SenderAvatar,
		RepositoryID:    repo.ID,
		StartTime:       lib.TimeNow(),
	}
	build, err := app.repo.Build.Create(buildModel)
	if err != nil {
		return err
	}

	for _, env := range config.Env {
		jobModel := &model.Job{
			Image:    config.Parsed.Image,
			Commands: string(commandsJSON),
			Env:      env,
			BuildID:  build.ID,
		}
		job, err := app.repo.Job.Create(jobModel)
		if err != nil {
			return err
		}
		if err := app.scheduleJob(job, build); err != nil {
			return err
		}
	}

	if err := app.broadcastNewBuild(build.ID); err != nil {
		return err
	}

	return nil
}

// TriggerBuild temp func.
func (app *App) TriggerBuild(repoID, userID uint) error {
	repo, err := app.repo.Repo.FindByID(repoID, userID)
	if err != nil {
		return err
	}
	scm, err := scm.NewSCM(context.Background(), repo.Provider.Name, repo.Provider.URL, repo.Provider.AccessToken)
	if err != nil {
		return err
	}
	ref, err := scm.FindBranch(repo.FullName, repo.DefaultBranch)
	if err != nil {
		return err
	}
	commit, err := scm.LastCommit(repo.FullName, repo.DefaultBranch)
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
	commandsJSON, err := json.Marshal(config.Commands)
	if err != nil {
		return err
	}

	buildModel := model.Build{
		Branch:          repo.DefaultBranch,
		Ref:             ref.Path,
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
		StartTime:       lib.TimeNow(),
	}
	build, err := app.repo.Build.Create(buildModel)
	if err != nil {
		return err
	}

	for _, env := range config.Env {
		jobModel := &model.Job{
			Image:    config.Parsed.Image,
			Commands: string(commandsJSON),
			Env:      env,
			BuildID:  build.ID,
		}
		job, err := app.repo.Job.Create(jobModel)
		if err != nil {
			return err
		}
		if err := app.scheduleJob(job, build); err != nil {
			return err
		}
	}

	if err := app.broadcastNewBuild(build.ID); err != nil {
		return err
	}

	return nil
}

// StopJob stops the job with given id.
func (app *App) StopJob(jobID uint) error {
	return app.scheduler.Cancel(jobID)
}

// RestartJob stops or unqueue the job if running and schedule it again.
func (app *App) RestartJob(jobID uint) error {
	if err := app.StopJob(jobID); err != nil {
		return err
	}
	job, err := app.repo.Job.Find(jobID)
	if err != nil {
		return err
	}
	return app.scheduleJob(job, *job.Build)
}

// StopBuild stops the build and related jobs.
func (app *App) StopBuild(buildID uint) (model.Build, error) {
	build, err := app.repo.Build.FindAll(buildID)
	if err != nil {
		return build, err
	}
	var wg sync.WaitGroup
	wg.Add(len(build.Jobs))
	for _, job := range build.Jobs {
		go func(job *model.Job) {
			if err := app.scheduler.Cancel(job.ID); err != nil {
				app.logger.Errorf("error stopping job %d: %v", job.ID, err)
			}
			wg.Done()
		}(job)
	}
	wg.Wait()
	return build, err
}

// RestartBuild stops the current build related jobs if any, then start them again.
func (app *App) RestartBuild(buildID uint) error {
	build, err := app.StopBuild(buildID)
	if err != nil {
		return err
	}
	build.StartTime = nil
	build.EndTime = nil
	if build, err = app.repo.Build.Update(build); err != nil {
		return err
	}
	var wg sync.WaitGroup
	wg.Add(len(build.Jobs))
	for _, job := range build.Jobs {
		go func(job *model.Job) {
			if err := app.scheduleJob(job, build); err != nil {
				app.logger.Debugf("error scheduling job %d: %v", job.ID, err)
			}
			wg.Done()
		}(job)
	}
	wg.Wait()
	return nil
}

func (app *App) scheduleJob(job *model.Job, build model.Build) error {
	j := &common.Job{
		ID:            job.ID,
		BuildID:       job.BuildID,
		Commands:      job.Commands,
		Image:         job.Image,
		Env:           job.Env,
		URL:           build.Repository.URL,
		ProviderName:  build.Repository.Provider.Name,
		ProviderURL:   build.Repository.Provider.URL,
		ProviderToken: build.Repository.Provider.AccessToken,
		Ref:           build.Ref,
		CommitSHA:     build.Commit,
		RepoName:      build.Repository.FullName,
		Priority:      uint16(1000),
		Status:        common.StatusUnknown,
	}
	app.scheduler.Schedule(j)
	return nil
}

func (app *App) updateBuildTime(buildID uint) error {
	build, err := app.repo.Build.FindAll(buildID)
	if err != nil {
		return err
	}
	if build.StartTime != nil && build.EndTime != nil {
		return nil
	}

	alldone := true
	var startTime *time.Time
	var endTime *time.Time
	for _, j := range build.Jobs {
		if j.EndTime == nil {
			alldone = false
			break
		} else {
			if endTime == nil || j.EndTime.After(*endTime) {
				endTime = j.EndTime
			}
		}
		if startTime == nil || (j.StartTime != nil && j.StartTime.Before(*startTime)) {
			startTime = j.StartTime
		}
	}
	if startTime != nil {
		build.StartTime = startTime
		if _, err := app.repo.Build.Update(build); err != nil {
			return err
		}
	}
	if alldone && endTime != nil {
		build.EndTime = endTime
		if _, err := app.repo.Build.Update(build); err != nil {
			return err
		}
	}
	return nil
}

func (app *App) logBuild(b common.Build) {
	if b.PrNumber != 0 {
		app.logger.Infof(
			"pull request %d on repository %s with ref: %s branch: %s sha: %s",
			b.PrNumber, b.RepoName, b.Ref, b.Branch, b.CommitSHA,
		)
	} else {
		app.logger.Infof(
			"push event on repository %s with ref: %s branch: %s sha: %s",
			b.RepoName, b.Ref, b.Branch, b.CommitSHA,
		)
	}
}
