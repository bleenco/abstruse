package core

import (
	"encoding/json"
	"strconv"
	"strings"
	"time"

	pb "github.com/bleenco/abstruse/proto"
	"github.com/bleenco/abstruse/server/api/parser"
	"github.com/bleenco/abstruse/server/db"
)

// StartBuild saves new build info into db and schedule related jobs.
func StartBuild(repoID int, branch, pr, commit string) error {
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
		return err
	}

	if err := configParser.Parse(); err != nil {
		return err
	}

	_, commands, config, env := configParser.Parsed.Image, configParser.Commands, configParser.Raw, configParser.Env

	build := db.Build{
		Branch:       branch,
		PR:           pr,
		Commit:       commit,
		Config:       config,
		StartTime:    func(t time.Time) *time.Time { return &t }(time.Now()),
		RepositoryID: uint(repoID),
	}
	if err := build.Create(); err != nil {
		return err
	}

	buildRun := db.BuildRun{BuildID: build.ID}
	if err := buildRun.Create(); err != nil {
		return err
	}

	commandsJSON, err := json.Marshal(commands)
	if err != nil {
		return err
	}

	for _, e := range env {
		job := db.Job{
			Image:    "ubuntu_latest_node",
			Commands: string(commandsJSON),
			Env:      e,
			BuildID:  build.ID,
		}
		if err := job.Create(); err != nil {
			return err
		}

		jobRun := db.JobRun{
			Status:     "queued",
			Log:        "",
			JobID:      job.ID,
			BuildRunID: buildRun.ID,
		}
		if err := jobRun.Create(); err != nil {
			return err
		}

		name := "abstruse_job_" + strconv.Itoa(int(build.ID)) + "_" + strconv.Itoa(int(job.ID)) + "_" + strconv.Itoa(int(buildRun.ID)) + "_" + strconv.Itoa(int(jobRun.ID))
		jobTask := &pb.JobTask{
			Name:     name,
			Code:     pb.JobTask_Start,
			Commands: commands,
			Image:    "ubuntu_latest_node",
			Env:      strings.Split(e, " "),
		}

		MainScheduler.ScheduleJobTask(jobTask, build.ID, buildRun.ID, job.ID, jobRun.ID)
	}

	return nil
}
