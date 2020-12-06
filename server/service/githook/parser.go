package githook

import (
	"fmt"
	"net/http"
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
	if err == scm.ErrUnknownEvent {
		return nil, nil, nil
	}
	if err != nil {
		return nil, nil, err
	}

	switch h := payload.(type) {
	case *scm.PushHook:
		return parsePushHook(h)
	case *scm.TagHook:
		return nil, nil, nil
	case *scm.PullRequestHook:
		return nil, nil, nil
	case *scm.BranchHook:
		return nil, nil, nil
	default:
		return nil, nil, nil
	}
}

func parsePushHook(h *scm.PushHook) (*core.GitHook, *core.Repository, error) {
	repo := &core.Repository{}
	githook := &core.GitHook{}

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
