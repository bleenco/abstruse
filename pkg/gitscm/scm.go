package gitscm

import (
	"context"
	"encoding/json"
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
)

// SCM represents source code management instance.
type SCM struct {
	provider string
	url      string
	token    string
	client   *scm.Client
	ctx      context.Context
}

// New returns new instance of SCM.
func New(ctx context.Context, provider, url, token string) (SCM, error) {
	var err error
	scm := SCM{
		provider: provider,
		url:      url,
		token:    token,
		ctx:      ctx,
	}

	switch provider {
	case "github":
		scm.client, err = github.New(scm.url)
	case "bitbucket":
		scm.client, err = bitbucket.New(scm.url)
	case "stash":
		scm.client, err = stash.New(scm.url)
	case "gitea":
		scm.client, err = gitea.New(scm.url)
	case "gitlab":
		scm.client, err = gitlab.New(scm.url)
	case "gogs":
		scm.client, err = gogs.New(scm.url)
	default:
		return scm, fmt.Errorf("unknown scm provider")
	}

	scm.client.Client = &http.Client{
		Transport: &transport.BearerToken{Token: scm.token},
	}

	return scm, err
}

// ListRepos returns list of repositories.
func (s SCM) ListRepos(page, size int) ([]*scm.Repository, error) {
	repos, _, err := s.client.Repositories.List(s.ctx, scm.ListOptions{Page: page, Size: size})
	return repos, err
}

// FindRepo finds repository.
func (s SCM) FindRepo(name string) (*scm.Repository, error) {
	repo, _, err := s.client.Repositories.Find(s.ctx, name)
	return repo, err
}

// FindPerms returns perms of repo.
func (s SCM) FindPerms(repo *scm.Repository) (*scm.Perm, error) {
	perm, _, err := s.client.Repositories.FindPerms(s.ctx, fmt.Sprintf("%s/%s", repo.Namespace, repo.Name))
	return perm, err
}

// ListCommits returns list of commits.
func (s SCM) ListCommits(repo, branch string) ([]*scm.Commit, error) {
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
	if err := json.NewDecoder(res.Body).Decode(&out); err != nil {
		return nil, err
	}
	var commits []*scm.Commit
	for _, o := range out {
		commits = append(commits, convertCommitInfo(o))
	}
	return commits, nil
}

// LastCommit returns last commit.
func (s SCM) LastCommit(repo, branch string) (*scm.Commit, error) {
	commits, err := s.ListCommits(repo, branch)
	if err != nil {
		return nil, err
	}
	if len(commits) > 0 {
		return commits[0], nil
	}
	return nil, fmt.Errorf("not found")
}

// FindCommit finds commit.
func (s SCM) FindCommit(repo, ref string) (*scm.Commit, error) {
	commit, _, err := s.client.Git.FindCommit(s.ctx, repo, ref)
	return commit, err
}

// FindBranch finds a git branch by name.
func (s SCM) FindBranch(repo, name string) (*scm.Reference, error) {
	reference, _, err := s.client.Git.FindBranch(s.ctx, repo, name)
	return reference, err
}

// FindTag finds a git tag by name.
func (s SCM) FindTag(repo, name string) (*scm.Reference, error) {
	tag, _, err := s.client.Git.FindTag(s.ctx, repo, name)
	return tag, err
}

// FindContent finds content of a repository file.
func (s SCM) FindContent(repo, ref, path string) (*scm.Content, error) {
	content, _, err := s.client.Contents.Find(s.ctx, repo, path, ref)
	return content, err
}

// ListContent returns a list of contents in a repo directory by path.
func (s SCM) ListContent(repo, ref, path string) ([]*scm.Content, error) {
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
func (s SCM) RefType(ref string) string {
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

// ListHooks returns webhooks applied for the repository.
func (s SCM) ListHooks(repo string) ([]*scm.Hook, error) {
	opts := scm.ListOptions{Page: 1, Size: 30}
	hooks, _, err := s.client.Repositories.ListHooks(s.ctx, repo, opts)
	return hooks, err
}

// CreateHook creates hook for specified repository.
func (s SCM) CreateHook(repo, target, secret, provider string, data HookForm) (*scm.Hook, error) {
	input := &scm.HookInput{
		Name:       "Abstruse CI",
		Target:     target,
		Secret:     secret,
		SkipVerify: false,
	}

	if provider == "gitea" {
		var events []string
		if data.Branch || data.Tag {
			events = append(events, "create")
		}
		if data.PullRequest {
			events = append(events, "pull_request")
		}
		if data.Push {
			events = append(events, "push")
		}
		input.NativeEvents = events
	} else {
		input.Events = scm.HookEvents{
			Branch:             data.Branch,
			Push:               data.Push,
			Tag:                data.Tag,
			PullRequest:        data.PullRequest,
			Issue:              false,
			IssueComment:       false,
			PullRequestComment: false,
			ReviewComment:      false,
		}
	}

	hook, _, err := s.client.Repositories.CreateHook(s.ctx, repo, input)
	return hook, err
}

// DeleteHook deletes webhook by ID.
func (s SCM) DeleteHook(repo string, ID string) error {
	_, err := s.client.Repositories.DeleteHook(s.ctx, repo, ID)
	return err
}

// CreateStatus sends build status to SCM provider.
func (s SCM) CreateStatus(repo, sha, url string, state scm.State) error {
	var message string
	switch state {
	case scm.StateSuccess:
		message = "Abstruse CI build successful."
	case scm.StatePending:
		message = "Abstruse CI build is running."
	case scm.StateFailure:
		message = "Abstruse CI build failed."
	case scm.StateRunning:
		message = "Abstruse CI build running."
	case scm.StateError:
		message = "Abstruse CI build errored."
	case scm.StateCanceled:
		message = "Abstruse CI build cancelled."
	}

	input := &scm.StatusInput{
		State:  state,
		Label:  "continuous-integration",
		Desc:   message,
		Target: url,
	}
	_, _, err := s.client.Repositories.CreateStatus(s.ctx, repo, sha, input)
	return err
}

// Client returns underlying scm client.
func (s SCM) Client() *scm.Client {
	return s.client
}
