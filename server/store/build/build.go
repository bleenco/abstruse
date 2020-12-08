package build

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/bleenco/abstruse/pkg/gitscm"
	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/server/core"
	"github.com/bleenco/abstruse/server/parser"
	"github.com/jinzhu/gorm"
)

// New returns a new BuildStore
func New(db *gorm.DB, repos core.RepositoryStore, jobs core.JobStore) core.BuildStore {
	return buildStore{db, repos, jobs}
}

type buildStore struct {
	db    *gorm.DB
	repos core.RepositoryStore
	jobs  core.JobStore
}

func (s buildStore) Find(id uint) (*core.Build, error) {
	var build core.Build
	err := s.db.Model(&build).Preload("Jobs").Preload("Repository.Provider").Where("id = ?", id).First(&build).Error
	return &build, err
}

func (s buildStore) List(filters core.BuildFilter) ([]*core.Build, error) {
	var builds []*core.Build
	db := s.db

	if filters.RepositoryID > 0 {
		db = db.Where("repository_id = ?", uint(filters.RepositoryID))
	}

	if filters.Kind == "pull-requests" {
		db = db.Where("pr != ?", 0)
	} else if filters.Kind == "commits" || filters.Kind == "branches" {
		db = db.Where("pr = ?", 0)
	}

	err := db.Preload("Jobs").Preload("Repository").Order("created_at desc").Limit(filters.Limit).Offset(filters.Offset).Find(&builds).Error
	return builds, err
}

func (s buildStore) Create(build *core.Build) error {
	return s.db.Create(build).Error
}

func (s buildStore) Update(build *core.Build) error {
	return s.db.Model(build).Updates(map[string]interface{}{"start_time": build.StartTime, "end_time": build.EndTime}).Error
}

func (s buildStore) Delete(build *core.Build) error {
	return s.db.Delete(build).Error
}

func (s buildStore) GenerateBuild(repo *core.Repository, base *core.GitHook) ([]*core.Job, uint, error) {
	scm, err := gitscm.New(context.Background(), repo.Provider.Name, repo.Provider.URL, repo.Provider.AccessToken)
	if err != nil {
		return nil, 0, err
	}
	ref, err := scm.FindBranch(repo.FullName, base.Target)
	if err != nil {
		return nil, 0, err
	}
	reference := ref.Path
	if base.PrNumber != 0 {
		reference = base.Ref
	}
	if base.After == "" || (base.Message == "" && base.PrNumber == 0) {
		commit, err := scm.LastCommit(repo.FullName, base.Target)
		if err != nil {
			return nil, 0, err
		}
		if base.After == "" {
			base.After = commit.Sha
		}
		if base.Message == "" {
			base.Message = commit.Message
		}
	}
	content, err := scm.FindContent(repo.FullName, base.After, ".abstruse.yml")
	if err != nil {
		return nil, 0, err
	}
	config := parser.ConfigParser{Raw: string(content.Data)}
	if err := config.Parse(); err != nil {
		return nil, 0, err
	}
	commandsJSON, err := json.Marshal(config.Commands)
	if err != nil {
		return nil, 0, err
	}

	build := &core.Build{
		Branch:          base.Target,
		Ref:             reference,
		Commit:          base.After,
		CommitMessage:   base.Message,
		PR:              base.PrNumber,
		PRTitle:         base.PrTitle,
		Config:          string(content.Data),
		AuthorLogin:     base.AuthorLogin,
		AuthorName:      base.AuthorName,
		AuthorEmail:     base.AuthorEmail,
		AuthorAvatar:    base.AuthorAvatar,
		CommitterLogin:  base.SenderLogin,
		CommitterName:   base.SenderName,
		CommitterEmail:  base.SenderEmail,
		CommitterAvatar: base.SenderAvatar,
		RepositoryID:    repo.ID,
		StartTime:       lib.TimeNow(),
	}
	if err := s.Create(build); err != nil {
		return nil, 0, err
	}

	var jobs []*core.Job

	for _, env := range config.Env {
		job := &core.Job{
			Image:    config.Parsed.Image,
			Commands: string(commandsJSON),
			Env:      env,
			BuildID:  build.ID,
		}
		if err := s.jobs.Create(job); err != nil {
			return nil, 0, err
		}
		job, err := s.jobs.Find(job.ID)
		if err != nil {
			return nil, 0, err
		}

		jobs = append(jobs, job)
	}

	return jobs, build.ID, nil
}

func (s buildStore) TriggerBuild(opts core.TriggerBuildOpts) ([]*core.Job, error) {
	repo, err := s.repos.Find(opts.ID)
	if err != nil {
		return nil, err
	}
	scm, err := gitscm.New(context.Background(), repo.Provider.Name, repo.Provider.URL, repo.Provider.AccessToken)
	if err != nil {
		return nil, err
	}

	build := &core.Build{}

	branch := opts.Branch
	sha := opts.SHA
	content := opts.Config

	if branch == "" {
		branch = repo.DefaultBranch
		build.Branch = branch
	}

	ref, err := scm.FindBranch(repo.FullName, branch)
	if err != nil {
		fmt.Println("branch", repo.DefaultBranch)
		return nil, err
	}
	build.Ref = ref.Path

	if sha == "" {
		commit, err := scm.LastCommit(repo.FullName, branch)
		if err != nil {
			fmt.Println("last commit")
			return nil, err
		}
		sha = commit.Sha

		build.Commit = commit.Sha
		build.CommitMessage = commit.Message
		build.AuthorLogin = commit.Author.Login
		build.AuthorName = commit.Author.Name
		build.AuthorEmail = commit.Author.Email
		build.AuthorAvatar = commit.Author.Avatar
		build.CommitterLogin = commit.Committer.Login
		build.CommitterName = commit.Committer.Name
		build.CommitterEmail = commit.Committer.Email
		build.CommitterAvatar = commit.Committer.Avatar
	} else {
		commit, err := scm.FindCommit(repo.FullName, sha)
		if err != nil {
			fmt.Println("find commit")
			return nil, err
		}

		build.Commit = commit.Sha
		build.CommitMessage = commit.Message
		build.AuthorLogin = commit.Author.Login
		build.AuthorName = commit.Author.Name
		build.AuthorEmail = commit.Author.Email
		build.AuthorAvatar = commit.Author.Avatar
		build.CommitterLogin = commit.Committer.Login
		build.CommitterName = commit.Committer.Name
		build.CommitterEmail = commit.Committer.Email
		build.CommitterAvatar = commit.Committer.Avatar
	}

	if content == "" {
		raw, err := scm.FindContent(repo.FullName, sha, ".abstruse.yml")
		if err != nil {
			fmt.Println("content")
			return nil, err
		}
		content = string(raw.Data)
	}

	build.Config = content

	config := parser.ConfigParser{Raw: content}
	if err := config.Parse(); err != nil {
		return nil, err
	}
	commandsJSON, err := json.Marshal(config.Commands)
	if err != nil {
		return nil, err
	}

	build.RepositoryID = repo.ID
	build.StartTime = lib.TimeNow()

	if err := s.Create(build); err != nil {
		return nil, err
	}

	var jobs []*core.Job

	for _, env := range config.Env {
		job := &core.Job{
			Image:    config.Parsed.Image,
			Commands: string(commandsJSON),
			Env:      env,
			BuildID:  build.ID,
		}
		if err := s.jobs.Create(job); err != nil {
			return nil, err
		}
		job, err := s.jobs.Find(job.ID)
		if err != nil {
			return nil, err
		}

		jobs = append(jobs, job)
	}

	return jobs, nil
}
