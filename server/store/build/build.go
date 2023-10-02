package build

import (
	"context"
	"fmt"
	"strings"

	"github.com/bleenco/abstruse/pkg/gitscm"
	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/server/core"
	"github.com/bleenco/abstruse/server/parser"
	"github.com/jinzhu/gorm"
	"google.golang.org/protobuf/encoding/protojson"
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

func (s buildStore) FindUser(id, userID uint) (*core.Build, error) {
	var build core.Build
	err := s.db.Model(&build).Preload("Jobs").Preload("Repository.Provider").Where("id = ?", id).First(&build).Error
	if err != nil {
		return &build, err
	}
	build.Repository.Perms = s.repos.GetPermissions(build.RepositoryID, userID)
	return &build, err
}

func (s buildStore) FindStatus(token, branch string) (string, error) {
	build := &core.Build{}

	repo, err := s.repos.FindToken(token)
	if err != nil || repo == nil {
		return core.BuildStatusUnknown, fmt.Errorf("repository not found")
	}
	if branch == "" {
		branch = repo.DefaultBranch
	}

	err = s.db.Preload("Jobs").Where("pr = ? AND repository_id = ? AND branch = ?", 0, repo.ID, branch).Last(&build).Error
	if err != nil {
		return core.BuildStatusUnknown, err
	}

	running, failing := false, false
	for _, job := range build.Jobs {
		if job.Status == "running" {
			running = true
		}
		if job.Status == "failing" {
			failing = true
		}
	}

	if running {
		return core.BuildStatusRunning, nil
	}
	if failing {
		return core.BuildStatusFailing, nil
	}
	return core.BuildStatusPassing, nil
}

func (s buildStore) List(filters core.BuildFilter) ([]*core.Build, error) {
	var builds []*core.Build
	db := s.db

	db = db.Preload("Jobs").Preload("Repository")
	db = db.Joins("LEFT JOIN repositories ON repositories.id = builds.repository_id").
		Joins("LEFT JOIN permissions ON permissions.repository_id = repositories.id").
		Joins("LEFT JOIN teams ON teams.id = permissions.team_id").
		Joins("LEFT JOIN team_users ON team_users.team_id = teams.id")

	if filters.RepositoryID > 0 || filters.Kind != "latest" {
		if filters.RepositoryID > 0 {
			db = db.Where("builds.repository_id = ?", uint(filters.RepositoryID))
		}

		if filters.Kind == "pull-requests" {
			db = db.Where("builds.pr != ?", 0)
		} else if filters.Kind == "commits" || filters.Kind == "branches" {
			db = db.Where("builds.pr = ?", 0)
		}

		db = db.Where(db.Where("repositories.user_id = ?", filters.UserID).Or("team_users.user_id = ? AND permissions.read = ?", filters.UserID, true))
	} else {
		db = db.Where("repositories.user_id = ?", filters.UserID).Or("team_users.user_id = ? AND permissions.read = ?", filters.UserID, true)
	}

	err := db.Order("builds.created_at desc").Group("builds.id").Limit(filters.Limit).Offset(filters.Offset).Find(&builds).Error

	for i, build := range builds {
		builds[i].Repository.Perms = s.repos.GetPermissions(build.RepositoryID, filters.UserID)
	}

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

	var mnts []string
	for _, mount := range repo.Mounts {
		mnts = append(mnts, fmt.Sprintf("%s:%s", mount.Host, mount.Container))
	}

	parser := parser.NewConfigParser(string(content.Data), base.Target, parser.GenerateGlobalEnv(build), mnts)
	pjobs, err := parser.Parse()
	if err != nil {
		return nil, 0, err
	}

	if !parser.ShouldBuild() {
		return nil, 0, fmt.Errorf("branch %s is ignored or not marked to build in config", base.Target)
	}

	if err := s.Create(build); err != nil {
		return nil, 0, err
	}

	var jobs []*core.Job
	for _, j := range pjobs {
		commands, err := protojson.Marshal(j.Commands)
		if err != nil {
			return nil, 0, err
		}

		job := &core.Job{
			Image:    j.Image,
			Commands: string(commands),
			Env:      strings.Join(j.Env, " "),
			Stage:    j.Stage,
			BuildID:  build.ID,
			Mount:    strings.Join(mnts, ","),
			Cache:    strings.Join(j.Cache, ","),
		}
		if err := s.jobs.Create(job); err != nil {
			return nil, 0, err
		}
		job, err = s.jobs.Find(job.ID)
		if err != nil {
			return nil, 0, err
		}

		jobs = append(jobs, job)
	}

	return jobs, build.ID, nil
}

func (s buildStore) TriggerBuild(opts core.TriggerBuildOpts) ([]*core.Job, error) {
	repo, err := s.repos.Find(opts.ID, opts.UserID)
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
			return nil, err
		}
		content = string(raw.Data)
	}

	build.Config = content

	var mnts []string
	for _, mount := range repo.Mounts {
		mnts = append(mnts, fmt.Sprintf("%s:%s", mount.Host, mount.Container))
	}

	parser := parser.NewConfigParser(content, branch, parser.GenerateGlobalEnv(build), mnts)
	pjobs, err := parser.Parse()
	if err != nil {
		return nil, err
	}

	if !parser.ShouldBuild() {
		return nil, fmt.Errorf("branch %s is ignored or not marked to build in config", branch)
	}

	build.RepositoryID = repo.ID
	build.StartTime = lib.TimeNow()

	if err := s.Create(build); err != nil {
		return nil, err
	}

	var jobs []*core.Job
	for platform := range strings.Split(repo.Platforms, ";") {
		for _, j := range pjobs {
			commands, err := protojson.Marshal(j.Commands)
			if err != nil {
				return nil, err
			}

			job := &core.Job{
				Image:    j.Image,
				Commands: string(commands),
				Env:      strings.Join(j.Env, " "),
				Mount:    strings.Join(mnts, ","),
				Stage:    j.Stage,
				BuildID:  build.ID,
				Cache:    strings.Join(j.Cache, ","),
				Platform: strings.Split(repo.Platforms, ";")[platform],
			}
			if err := s.jobs.Create(job); err != nil {
				return nil, err
			}
			job, err = s.jobs.Find(job.ID)
			if err != nil {
				return nil, err
			}

			jobs = append(jobs, job)
		}
	}
	return jobs, nil
}
