package scm

import (
	"context"
	"fmt"
	"net/http"

	"github.com/drone/go-scm/scm"
	"github.com/drone/go-scm/scm/driver/bitbucket"
	"github.com/drone/go-scm/scm/driver/gitea"
	"github.com/drone/go-scm/scm/driver/github"
	"github.com/drone/go-scm/scm/driver/gitlab"
	"github.com/drone/go-scm/scm/driver/gogs"
	"github.com/drone/go-scm/scm/driver/stash"
	"github.com/drone/go-scm/scm/transport"
	jsoniter "github.com/json-iterator/go"
)

// State defines build state.
type State int

const (
	// StateUnknown unknown state.
	StateUnknown State = iota
	// StatePending build is pending.
	StatePending
	// StateRunning build is running.
	StateRunning
	// StateSuccess build has done with exit code 0.
	StateSuccess
	// StateFailure build failed.
	StateFailure
	// StateCanceled build canceled.
	StateCanceled
	// StateError build errored.
	StateError
)

// SCM represents source code management instance.
type SCM struct {
	provider string
	url      string
	repo     string
	token    string
	client   *scm.Client
	ctx      context.Context
}

// NewSCM returns new instance of SCM.
func NewSCM(ctx context.Context, provider string, url, token string) (*SCM, error) {
	scm := &SCM{provider: provider, url: url, token: token, ctx: ctx}
	if err := scm.init(); err != nil {
		return nil, err
	}
	return scm, nil
}

func (s *SCM) init() (err error) {
	switch s.provider {
	case "github":
		s.client, err = github.New(s.url)
	case "bitbucket":
		s.client, err = bitbucket.New(s.url)
	case "gitea":
		s.client, err = gitea.New(s.url)
	case "gitlab":
		s.client, err = gitlab.New(s.url)
	case "gogs":
		s.client, err = gogs.New(s.url)
	case "stash":
		s.client, err = stash.New(s.url)
	default:
		return fmt.Errorf("unknown provider")
	}
	if err != nil {
		return err
	}

	s.client.Client = &http.Client{
		Transport: &transport.BearerToken{Token: s.token},
	}

	return err
}

// ListRepos returns list of repositories.
func (s *SCM) ListRepos(page, size int) ([]*scm.Repository, error) {
	repos, _, err := s.client.Repositories.List(s.ctx, scm.ListOptions{Page: page, Size: size})
	return repos, err
}

// FindRepo finds repository.
func (s *SCM) FindRepo(name string) (*scm.Repository, error) {
	repo, _, err := s.client.Repositories.Find(s.ctx, name)
	return repo, err
}

// ListCommits returns list of commits.
func (s *SCM) ListCommits(repo, branch string) ([]*scm.Commit, error) {
	if s.provider != "gitea" {
		commits, _, err := s.client.Git.ListCommits(s.ctx, repo, scm.CommitListOptions{Ref: branch})
		return commits, err
	}
	path := fmt.Sprintf("api/v1/repos/%s/commits?sha=%s", repo, branch)
	out := []*commitInfo{}
	res, err := s.client.Do(s.ctx, &scm.Request{Method: "GET", Path: path})
	if err != nil {
		return nil, err
	}
	if err := jsoniter.NewDecoder(res.Body).Decode(&out); err != nil {
		return nil, err
	}
	var commits []*scm.Commit
	for _, o := range out {
		commits = append(commits, convertCommitInfo(o))
	}
	return commits, nil
}

// LastCommit returns last commit.
func (s *SCM) LastCommit(repo, branch string) (*scm.Commit, error) {
	commits, err := s.ListCommits(repo, branch)
	if err != nil {
		return nil, err
	}
	if len(commits) > 0 {
		return commits[0], nil
	} else {
		return nil, fmt.Errorf("not found")
	}
}

// FindCommit finds commit.
func (s *SCM) FindCommit(repo, ref string) (*scm.Commit, error) {
	commit, _, err := s.client.Git.FindCommit(s.ctx, repo, ref)
	return commit, err
}

// FindBranch finds a git branch by name.
func (s *SCM) FindBranch(repo, name string) (*scm.Reference, error) {
	reference, _, err := s.client.Git.FindBranch(s.ctx, repo, name)
	return reference, err
}

// FindTag finds a git tag by name.
func (s *SCM) FindTag(repo, name string) (*scm.Reference, error) {
	tag, _, err := s.client.Git.FindTag(s.ctx, repo, name)
	return tag, err
}

// FindContent finds content of a repository file.
func (s *SCM) FindContent(repo, ref, path string) (*scm.Content, error) {
	content, _, err := s.client.Contents.Find(s.ctx, repo, path, ref)
	return content, err
}

// ListContent returns a list of contents in a repo directory by path.
func (s *SCM) ListContent(repo, ref, path string) ([]*scm.Content, error) {
	contents, _, err := s.client.Contents.List(s.ctx, repo, path, ref, scm.ListOptions{})
	if err != nil {
		return nil, err
	}
	var content []*scm.Content
	for _, c := range contents {
		if c.Kind == scm.ContentKindFile {
			scmcontent, err := s.FindContent(repo, ref, c.Path)
			if err != nil {
				return nil, err
			}
			content = append(content, scmcontent)
		}
	}
	return content, nil
}

// RefType returns reference type.
func (s *SCM) RefType(ref string) string {
	if scm.IsPullRequest(ref) {
		return "pr"
	}
	if scm.IsTag(ref) {
		return "tag"
	}
	if scm.IsBranch(ref) {
		return "branch"
	}
	return "unknown"
}

// Client returns underlying scm client.
func (s *SCM) Client() *scm.Client {
	return s.client
}
