package githook

import (
	"fmt"
	"net/http"
	"path"
	"strings"

	"github.com/bleenco/abstruse/server/core"
	"github.com/drone/go-scm/scm"
)

const emptyCommit = "0000000000000000000000000000000000000000"

// NewParser returns a new GitHookParser.
func NewParser(client *scm.Client) core.GitHookParser {
	return &parser{client}
}

type parser struct {
	client *scm.Client
}

func (p *parser) Parse(req *http.Request, secretFunc func(string) *core.Repository) (*core.GitHook, *core.Repository, error) {
	fn := func(webhook scm.Webhook) (string, error) {
		if webhook == nil {
			return "", scm.ErrUnknownEvent
		}
		repo := webhook.Repository()
		fullname := fmt.Sprintf("%s/%s", repo.Namespace, repo.Name)
		r := secretFunc(fullname)
		if r == nil || r.Provider.Secret == "" {
			return "", fmt.Errorf("cannot find repository")
		}
		return r.Provider.Secret, nil
	}

	payload, err := p.client.Webhooks.Parse(req, fn)
	if err != nil {
		return nil, nil, err
	}

	switch h := payload.(type) {
	case *scm.PushHook:
		return p.parsePushHook(h)
	case *scm.TagHook:
		return p.parseTagHook(h)
	case *scm.PullRequestHook:
		return p.parsePRHook(h)
	case *scm.BranchHook:
		return p.parseBranchHook(h)
	default:
		return nil, nil, nil
	}
}

func (p *parser) parsePushHook(h *scm.PushHook) (*core.GitHook, *core.Repository, error) {
	var repo *core.Repository
	var githook *core.GitHook

	if h.Commit.Sha == emptyCommit {
		return nil, nil, nil
	}

	if strings.HasPrefix(h.Ref, "refs/tags/") {
		githook = &core.GitHook{
			Event:        core.EventTag,
			Action:       core.ActionCreate,
			Link:         h.Commit.Link,
			Timestamp:    h.Commit.Author.Date,
			Message:      h.Commit.Message,
			Before:       h.Before,
			After:        h.After,
			Source:       scm.TrimRef(h.BaseRef),
			Target:       scm.TrimRef(h.BaseRef),
			Ref:          h.Ref,
			AuthorEmail:  h.Commit.Author.Email,
			AuthorAvatar: h.Commit.Author.Avatar,
			AuthorName:   h.Commit.Author.Name,
			AuthorLogin:  h.Commit.Author.Login,
			SenderEmail:  h.Sender.Email,
			SenderAvatar: h.Sender.Avatar,
			SenderName:   h.Sender.Name,
			SenderLogin:  h.Sender.Login,
		}
	} else {
		githook = &core.GitHook{
			Event:        core.EventPush,
			Link:         h.Commit.Link,
			Timestamp:    h.Commit.Author.Date,
			Message:      h.Commit.Message,
			Before:       h.Before,
			After:        h.Commit.Sha,
			Ref:          h.Ref,
			Source:       strings.TrimPrefix(h.Ref, "refs/heads/"),
			Target:       strings.TrimPrefix(h.Ref, "refs/heads/"),
			AuthorEmail:  h.Commit.Author.Email,
			AuthorAvatar: h.Commit.Author.Avatar,
			AuthorName:   h.Commit.Author.Name,
			AuthorLogin:  h.Commit.Author.Login,
			SenderEmail:  h.Sender.Email,
			SenderAvatar: h.Sender.Avatar,
			SenderName:   h.Sender.Name,
			SenderLogin:  h.Sender.Login,
		}
	}

	// TODO: check branch field!
	repo = &core.Repository{
		UID:       h.Repo.ID,
		Namespace: h.Repo.Namespace,
		Name:      h.Repo.Name,
		FullName:  fmt.Sprintf("%s/%s", h.Repo.Namespace, h.Repo.Name),
		URL:       h.Repo.Link,
		Private:   h.Repo.Private,
		Clone:     h.Repo.Clone,
		CloneSSH:  h.Repo.CloneSSH,
	}

	if githook.AuthorAvatar == "" {
		githook.AuthorAvatar = h.Sender.Avatar
	}

	return githook, repo, nil
}

func (p *parser) parseTagHook(h *scm.TagHook) (*core.GitHook, *core.Repository, error) {
	if h.Action != scm.ActionCreate {
		return nil, nil, nil
	}

	// When tag is created github, gitea and gitlab sends both a push
	// and a tag hook. Push hook contains more info so we use that.
	if p.client.Driver == scm.DriverGithub ||
		p.client.Driver == scm.DriverGitea ||
		p.client.Driver == scm.DriverGitlab {
		return nil, nil, nil
	}

	githook := &core.GitHook{
		Event:        core.EventTag,
		Action:       core.ActionCreate,
		Link:         "",
		Message:      path.Base(h.Ref.Path),
		After:        h.Ref.Sha,
		Ref:          h.Ref.Name,
		Source:       h.Ref.Name,
		Target:       h.Ref.Name,
		AuthorLogin:  h.Sender.Login,
		AuthorName:   h.Sender.Name,
		AuthorEmail:  h.Sender.Email,
		AuthorAvatar: h.Sender.Avatar,
		SenderEmail:  h.Sender.Email,
		SenderAvatar: h.Sender.Avatar,
		SenderName:   h.Sender.Name,
		SenderLogin:  h.Sender.Login,
	}
	repo := &core.Repository{
		UID:       h.Repo.ID,
		Namespace: h.Repo.Namespace,
		Name:      h.Repo.Name,
		FullName:  fmt.Sprintf("%s/%s", h.Repo.Namespace, h.Repo.Name),
		URL:       h.Repo.Link,
		Private:   h.Repo.Private,
		Clone:     h.Repo.Clone,
		CloneSSH:  h.Repo.CloneSSH,
	}

	if !strings.HasPrefix(githook.Ref, "refs/tags/") {
		githook.Ref = fmt.Sprintf("refs/tags/%s", githook.Ref)
	}

	return githook, repo, nil
}

func (p *parser) parsePRHook(h *scm.PullRequestHook) (*core.GitHook, *core.Repository, error) {
	if h.Action == scm.ActionClose {
		return nil, nil, nil
	}

	if h.Action != scm.ActionOpen && h.Action != scm.ActionSync {
		return nil, nil, nil
	}

	githook := &core.GitHook{
		Event:        core.EventPullRequest,
		Action:       h.Action.String(),
		Link:         h.PullRequest.Link,
		Timestamp:    h.PullRequest.Created,
		Title:        h.PullRequest.Title,
		Message:      h.PullRequest.Body,
		Before:       h.PullRequest.Base.Sha,
		After:        h.PullRequest.Sha,
		Ref:          h.PullRequest.Ref,
		Fork:         h.PullRequest.Fork,
		Source:       h.PullRequest.Source,
		Target:       h.PullRequest.Target,
		AuthorLogin:  h.PullRequest.Author.Login,
		AuthorName:   h.PullRequest.Author.Name,
		AuthorEmail:  h.PullRequest.Author.Email,
		AuthorAvatar: h.PullRequest.Author.Avatar,
		SenderEmail:  h.Sender.Email,
		SenderAvatar: h.Sender.Avatar,
		SenderName:   h.Sender.Name,
		SenderLogin:  h.Sender.Login,
		PrNumber:     h.PullRequest.Number,
		PrTitle:      h.PullRequest.Title,
		PrBody:       h.PullRequest.Body,
	}
	repo := &core.Repository{
		UID:       h.Repo.ID,
		Namespace: h.Repo.Namespace,
		Name:      h.Repo.Name,
		FullName:  fmt.Sprintf("%s/%s", h.Repo.Namespace, h.Repo.Name),
		URL:       h.Repo.Link,
		Private:   h.Repo.Private,
		Clone:     h.Repo.Clone,
		CloneSSH:  h.Repo.CloneSSH,
	}

	return githook, repo, nil
}

func (p *parser) parseBranchHook(h *scm.BranchHook) (*core.GitHook, *core.Repository, error) {
	if h.Action != scm.ActionCreate || h.Action == scm.ActionDelete || p.client.Driver != scm.DriverStash {
		return nil, nil, nil
	}

	githook := &core.GitHook{
		Event:        core.EventPush,
		Link:         "",
		Message:      "",
		After:        h.Ref.Sha,
		Ref:          h.Ref.Name,
		Source:       h.Ref.Name,
		Target:       h.Ref.Name,
		AuthorLogin:  h.Sender.Login,
		AuthorName:   h.Sender.Name,
		AuthorEmail:  h.Sender.Email,
		AuthorAvatar: h.Sender.Avatar,
		SenderLogin:  h.Sender.Login,
		SenderName:   h.Sender.Name,
		SenderEmail:  h.Sender.Email,
		SenderAvatar: h.Sender.Avatar,
	}
	repo := &core.Repository{
		UID:       h.Repo.ID,
		Namespace: h.Repo.Namespace,
		Name:      h.Repo.Name,
		FullName:  fmt.Sprintf("%s/%s", h.Repo.Namespace, h.Repo.Name),
		URL:       h.Repo.Link,
		Private:   h.Repo.Private,
		Clone:     h.Repo.Clone,
		CloneSSH:  h.Repo.CloneSSH,
	}

	return githook, repo, nil
}
