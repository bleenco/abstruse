package server

import (
	"math/rand"
	"strconv"
	"strings"
	"time"

	"github.com/bleenco/abstruse/api/parser"
	"github.com/bleenco/abstruse/db"
	pb "github.com/bleenco/abstruse/proto"
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

	commit = "8e1c6452d41d7a45d0b16d5f711befdbbe2c0320"

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

	name := "abstruse_job_" + strconv.Itoa(int(build.ID)) + "_" + strconv.Itoa(rand.Intn(500))

	for _, e := range env {
		jobTask := &pb.JobTask{
			Name:     name,
			Code:     pb.JobTask_Start,
			Commands: commands,
			Image:    "ubuntu_latest_node",
			Env:      strings.Split(e, " "),
		}
		MainScheduler.ScheduleJobTask(jobTask)
	}

	return nil
}
