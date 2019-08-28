package core

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"

	pb "github.com/bleenco/abstruse/proto"
	"github.com/bleenco/abstruse/server/api/parser"
	"github.com/bleenco/abstruse/server/api/providers/github"
	"github.com/bleenco/abstruse/server/db"
	"github.com/bleenco/abstruse/server/websocket"
)

// StartBuild saves new build info into db and schedule related jobs.
func StartBuild(repoID, pr int, branch, prTitle, commit, commitMessage string) error {
	var repo db.Repository
	if err := repo.Find(repoID); err != nil {
		return err
	}

	if branch == "" {
		branch = repo.DefaultBranch
	}

	configParser := &parser.ConfigParser{
		CloneURL: repo.HTMLURL,
		Branch:   branch,
		PR:       pr,
		Commit:   commit,
	}

	if err := configParser.FetchRawConfig(); err != nil {
		fmt.Printf("%s\n", err.Error())
		return err
	}

	if err := configParser.Parse(); err != nil {
		return err
	}

	image, commands, config, env := configParser.Parsed.Image, configParser.Commands, configParser.Raw, configParser.Env

	build := db.Build{
		Branch:        branch,
		PR:            pr,
		PRTitle:       prTitle,
		Commit:        commit,
		CommitMessage: commitMessage,
		Config:        config,
		RepositoryID:  uint(repoID),
	}

	if repo.Provider == "github" {
		if integrations, err := db.FindIntegrationsByUserID(int(repo.User.ID)); err == nil {
			for _, i := range integrations {
				if i.Provider == "github" {
					if commitData, err := github.FetchCommitData(
						i.URL,
						i.AccessToken,
						i.Username,
						i.Password,
						repo.Name,
						commit,
					); err == nil {
						build.AuthorLogin = commitData.Author.GetLogin()
						build.AuthorName = commitData.Commit.Author.GetName()
						build.AuthorEmail = commitData.Commit.Author.GetEmail()
						build.AuthorAvatar = commitData.Author.GetAvatarURL()
						build.CommitterLogin = commitData.Committer.GetLogin()
						build.CommitterName = commitData.Commit.Committer.GetName()
						build.CommitterEmail = commitData.Commit.Committer.GetEmail()
						build.CommitterAvatar = commitData.Committer.GetAvatarURL()
					}
				}
			}
		}
	}

	if err := build.Create(); err != nil {
		return err
	}

	commandsJSON, err := json.Marshal(commands)
	if err != nil {
		return err
	}

	for _, e := range env {
		job := db.Job{
			Image:    image,
			Commands: string(commandsJSON),
			Env:      e,
			Status:   "queued",
			Log:      "",
			BuildID:  build.ID,
		}
		if err := job.Create(); err != nil {
			return err
		}

		name := "abstruse_job_" + strconv.Itoa(int(build.ID)) + "_" + strconv.Itoa(int(job.ID))
		jobTask := &pb.JobTask{
			Name:     name,
			Code:     pb.JobTask_Start,
			Commands: commands,
			Image:    image,
			Env:      strings.Split(e, " "),
		}

		MainScheduler.ScheduleJobTask(jobTask, build.ID, job.ID)
	}

	var b db.Build
	if err := b.FindAll(int(build.ID)); err == nil {
		data := map[string]interface{}{
			"build": b,
		}
		websocket.App.Broadcast("build_events", data, nil)
	}

	return nil
}

func updateJob(task *JobTask) error {
	var job db.Job
	if err := job.Find(int(task.jobID)); err != nil {
		return err
	}

	if err := job.Update(task.Status, strings.Join(task.Log, ""), &task.StartTime, &task.EndTime); err != nil {
		return err
	}

	var build db.Build
	if err := build.FindAll(int(task.buildID)); err == nil {
		if build.StartTime == nil {
			if err := build.UpdateStartTime(); err != nil {
				return err
			}
		}
		if build.EndTime == nil {
			allDone := true
			for _, j := range build.Jobs {
				if j.EndTime == nil {
					allDone = false
					break
				}
			}
			if allDone {
				if err := build.UpdateEndTime(); err != nil {
					return err
				}
			}
		}
	}

	return nil
}
