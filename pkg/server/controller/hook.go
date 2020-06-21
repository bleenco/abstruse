package controller

import (
	"fmt"
	"net/http"
	"path"

	"github.com/drone/go-scm/scm"
	"github.com/jkuri/abstruse/pkg/core"
	"github.com/jkuri/abstruse/pkg/server/app"
	"github.com/jkuri/abstruse/pkg/server/service"
	"github.com/julienschmidt/httprouter"
)

// HookController struct.
type HookController struct {
	hookService service.HookService
	repoService service.RepositoryService
	app         *app.App
}

// NewHookController returns HookController instance.
func NewHookController(hookService service.HookService, repoService service.RepositoryService, app *app.App) *HookController {
	return &HookController{hookService, repoService, app}
}

func (c *HookController) secret(webhook scm.Webhook) (secret string, err error) {
	repo := webhook.Repository()
	r, err := c.repoService.FindByURL(repo.Clone)
	if err != nil {
		return
	}
	return r.Provider.Secret, nil
}

// Hook for providers webhook trigger.
func (c *HookController) Hook(resp http.ResponseWriter, req *http.Request, _ httprouter.Params) {
	cli, err := c.hookService.DetectWebhook(req)
	if err != nil {
		JSONResponse(resp, http.StatusNotImplemented, Response{"not implemented"})
		return
	}
	client := cli.Client()
	webhook, err := client.Webhooks.Parse(req, c.secret)
	if err != nil {
		JSONResponse(resp, http.StatusBadRequest, ErrorResponse{err.Error()})
		return
	}
	switch event := webhook.(type) {
	case *scm.PushHook:
		if err := c.app.StartBuild(generateBuild(event)); err != nil {
			JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{err.Error()})
			return
		}
		break
	case *scm.PullRequestHook:
		if event.PullRequest.Closed {
			JSONResponse(resp, http.StatusOK, BoolResponse{true})
			return
		}
		if err := c.app.StartBuild(generatePR(event)); err != nil {
			JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{err.Error()})
			return
		}
		break
	case *scm.TagHook:
		if err := c.app.StartBuild(generateTagBuild(event)); err != nil {
			JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{err.Error()})
			return
		}
		break
	case *scm.BranchHook:
		if err := c.app.StartBuild(generateBranchBuild(event)); err != nil {
			JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{err.Error()})
			return
		}
		break
	}

	JSONResponse(resp, http.StatusOK, BoolResponse{true})
}

func generateBuild(event *scm.PushHook) core.Build {
	return core.Build{
		Branch:        event.Repo.Branch,
		Ref:           event.Ref,
		CommitSHA:     event.Commit.Sha,
		CommitMessage: event.Commit.Message,
		RepoURL:       event.Repo.Clone,
		RepoName:      fmt.Sprintf("%s/%s", event.Repo.Namespace, event.Repo.Name),
		AuthorName:    event.Commit.Author.Name,
		AuthorEmail:   event.Commit.Author.Email,
		AuthorAvatar:  event.Commit.Author.Avatar,
		AuthorLogin:   event.Commit.Author.Login,
		SenderName:    event.Sender.Name,
		SenderEmail:   event.Sender.Email,
		SenderAvatar:  event.Sender.Avatar,
		SenderLogin:   event.Sender.Login,
	}
}

func generatePR(event *scm.PullRequestHook) core.Build {
	return core.Build{
		Branch:       event.Repo.Branch,
		PrNumber:     event.PullRequest.Number,
		Ref:          event.PullRequest.Ref,
		CommitSHA:    event.PullRequest.Sha,
		PrTitle:      event.PullRequest.Title,
		PrBody:       event.PullRequest.Body,
		RepoURL:      event.Repo.Clone,
		RepoName:     fmt.Sprintf("%s/%s", event.Repo.Namespace, event.Repo.Name),
		AuthorName:   event.PullRequest.Author.Name,
		AuthorEmail:  event.PullRequest.Author.Email,
		AuthorAvatar: event.PullRequest.Author.Avatar,
		AuthorLogin:  event.PullRequest.Author.Login,
		SenderName:   event.Sender.Name,
		SenderEmail:  event.Sender.Email,
		SenderAvatar: event.Sender.Avatar,
		SenderLogin:  event.Sender.Login,
	}
}

func generateTagBuild(event *scm.TagHook) core.Build {
	return core.Build{
		Branch:        event.Repo.Branch,
		Ref:           event.Ref.Path,
		CommitSHA:     event.Ref.Sha,
		CommitMessage: path.Base(event.Ref.Path),
		RepoURL:       event.Repo.Clone,
		RepoName:      fmt.Sprintf("%s/%s", event.Repo.Namespace, event.Repo.Name),
		AuthorName:    event.Sender.Name,
		AuthorEmail:   event.Sender.Email,
		AuthorAvatar:  event.Sender.Avatar,
		AuthorLogin:   event.Sender.Login,
		SenderName:    event.Sender.Name,
		SenderEmail:   event.Sender.Email,
		SenderAvatar:  event.Sender.Avatar,
		SenderLogin:   event.Sender.Login,
	}
}

func generateBranchBuild(event *scm.BranchHook) core.Build {
	return core.Build{
		Branch:       event.Ref.Name,
		Ref:          fmt.Sprintf("refs/heads/%s", event.Ref.Name),
		CommitSHA:    event.Ref.Sha,
		RepoURL:      event.Repo.Clone,
		RepoName:     fmt.Sprintf("%s/%s", event.Repo.Namespace, event.Repo.Name),
		AuthorName:   event.Sender.Name,
		AuthorEmail:  event.Sender.Email,
		AuthorAvatar: event.Sender.Avatar,
		AuthorLogin:  event.Sender.Login,
		SenderName:   event.Sender.Name,
		SenderEmail:  event.Sender.Email,
		SenderAvatar: event.Sender.Avatar,
		SenderLogin:  event.Sender.Login,
	}
}
