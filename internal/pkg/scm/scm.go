package scm

import (
	"context"
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

// Provider defines scm provider.
type Provider string

const (
	// ProviderGithub github provider.
	ProviderGithub Provider = "github"
	// ProviderBitbucket bitbucket provider.
	ProviderBitbucket Provider = "bitbucket"
	// ProviderGitlab gitlab provider.
	ProviderGitlab Provider = "gitlab"
	// ProviderGitea gitea provider.
	ProviderGitea Provider = "gitea"
	// ProviderGogs gogs provider.
	ProviderGogs Provider = "gogs"
	// ProviderStash stash provider.
	ProviderStash Provider = "stash"
)

// SCM represents source code management instance.
type SCM struct {
	provider Provider
	url      string
	repo     string
	token    string
	client   *scm.Client
	ctx      context.Context
}

// NewSCM returns new instance of SCM.
func NewSCM(ctx context.Context, provider Provider, url, token string) (*SCM, error) {
	scm := &SCM{provider: provider, url: url, token: token, ctx: ctx}
	if err := scm.init(); err != nil {
		return nil, err
	}
	return scm, nil
}

func (s *SCM) init() (err error) {
	switch s.provider {
	case ProviderGithub:
		s.client, err = github.New(s.url)
	case ProviderBitbucket:
		s.client, err = bitbucket.New(s.url)
	case ProviderGitea:
		s.client, err = gitea.New(s.url)
	case ProviderGitlab:
		s.client, err = gitlab.New(s.url)
	case ProviderGogs:
		s.client, err = gogs.New(s.url)
	case ProviderStash:
		s.client, err = stash.New(s.url)
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
