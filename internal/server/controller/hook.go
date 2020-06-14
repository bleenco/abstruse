package controller

import (
	"fmt"
	"log"
	"net/http"

	"github.com/drone/go-scm/scm"
	"github.com/jkuri/abstruse/internal/core"
	"github.com/jkuri/abstruse/internal/server/app"
	"github.com/jkuri/abstruse/internal/server/service"
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
		log.Println(
			"push event",
			event.Ref,
			event.Commit.Sha,
			event.Commit.Message,
			event.Repo.Namespace,
			event.Repo.Name,
			event.Sender.Login,
		)
	case *scm.PullRequestHook:
		if event.PullRequest.Closed {
			JSONResponse(resp, http.StatusOK, BoolResponse{true})
			return
		}
		pr := core.PullRequest{
			Number:       event.PullRequest.Number,
			Ref:          event.PullRequest.Ref,
			CommitSHA:    event.PullRequest.Sha,
			Title:        event.PullRequest.Title,
			Body:         event.PullRequest.Body,
			RepoURL:      event.Repo.Clone,
			RepoBranch:   event.Repo.Branch,
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
		if err := c.app.StartBuildFromPR(pr); err != nil {
			JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{err.Error()})
			return
		}
		JSONResponse(resp, http.StatusOK, BoolResponse{true})
	default:
		JSONResponse(resp, http.StatusOK, BoolResponse{true})
	}

	// var payload interface{}
	// err := jsoniter.NewDecoder(req.Body).Decode(&payload)
	// if err != nil {
	// 	JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{err.Error()})
	// 	return
	// }
	// defer req.Body.Close()
	// file, _ := jsoniter.MarshalIndent(payload, "", "  ")
	// home, _ := fs.GetHomeDir()
	// folder := path.Clean(path.Join(home, "Desktop", "webhooks"))
	// if !fs.Exists(folder) {
	// 	if err := fs.MakeDir(folder); err != nil {
	// 		JSONResponse(resp, http.StatusInternalServerError, ErrorResponse{err.Error()})
	// 		return
	// 	}
	// }
	// filename := path.Clean(path.Join(folder, fmt.Sprintf("webhook_%s.json", util.FormatTime(time.Now()))))
	// _ = ioutil.WriteFile(filename, file, 0644)
}
