package api

import (
	"context"
	"fmt"
	"net/http"
	"path"

	"github.com/bleenco/abstruse/internal/common"
	"github.com/bleenco/abstruse/pkg/render"
	"github.com/bleenco/abstruse/pkg/scm"
	"github.com/bleenco/abstruse/server/core"
	"github.com/bleenco/abstruse/server/db/model"
	"github.com/bleenco/abstruse/server/webhook"
	goscm "github.com/drone/go-scm/scm"
	"go.uber.org/zap"
)

type webhooks struct {
	logger *zap.SugaredLogger
	app    *core.App
}

func newWebhooks(logger *zap.Logger, app *core.App) webhooks {
	return webhooks{
		logger: logger.With(zap.String("type", "webhooks")).Sugar(),
		app:    app,
	}
}

func (h *webhooks) hook() http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		repo, err := webhook.ParseWebhook(r)
		if err != nil {
			render.JSON(w, http.StatusBadRequest, render.Error{Message: err.Error()})
			return
		}

		cli, err := scm.NewSCM(context.Background(), repo.Provider.Name, repo.URL, repo.Provider.AccessToken)
		if err != nil {
			render.JSON(w, http.StatusNotImplemented, render.Error{Message: err.Error()})
			return
		}

		client := cli.Client()
		fn := func(webhook goscm.Webhook) (string, error) {
			return "", nil
		}
		webhook, err := client.Webhooks.Parse(r, fn)

		switch event := webhook.(type) {
		case *goscm.PushHook:
			if err := h.app.StartBuild(generateBuild(event)); err != nil {
				render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
				return
			}
		case *goscm.PullRequestHook:
			if event.PullRequest.Closed {
				render.JSON(w, http.StatusOK, render.Empty{})
				return
			}
			if err := h.app.StartBuild(generatePR(event, repo)); err != nil {
				render.JSON(w, http.StatusInternalServerError, render.Error{Message: err.Error()})
				return
			}
		case *goscm.TagHook:
			if err := h.app.StartBuild(generateTagBuild(event)); err != nil {
				render.JSON(w, http.StatusNotImplemented, render.Error{Message: err.Error()})
				return
			}
		case *goscm.BranchHook:
			if err := h.app.StartBuild(generateBranchBuild(event)); err != nil {
				render.JSON(w, http.StatusNotImplemented, render.Error{Message: err.Error()})
				return
			}
		}

		render.JSON(w, http.StatusOK, render.Empty{})
	})
}

func generateBuild(event *goscm.PushHook) common.Build {
	return common.Build{
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

func generatePR(event *goscm.PullRequestHook, repo model.Repository) common.Build {
	ref := event.PullRequest.Ref
	if repo.Provider.Name == "gitlab" {
		ref = fmt.Sprintf("refs/merge-requests/%d/head", event.PullRequest.Number)
	} else if repo.Provider.Name == "github" || repo.Provider.Name == "gitea" {
		ref = fmt.Sprintf("refs/pull/%d/head", event.PullRequest.Number)
	}

	return common.Build{
		Branch:       event.Repo.Branch,
		PrNumber:     event.PullRequest.Number,
		Ref:          ref,
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

func generateTagBuild(event *goscm.TagHook) common.Build {
	return common.Build{
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

func generateBranchBuild(event *goscm.BranchHook) common.Build {
	return common.Build{
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

// dir := "/Users/jan/Desktop/webhooks"

// return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
// 	headers := r.Header.Clone()
// 	data, err := ioutil.ReadAll(r.Body)
// 	if err != nil {
// 		h.logger.Errorf("error: %v", err)
// 	}
// 	r.Body.Close()
// 	r.Body = ioutil.NopCloser(bytes.NewBuffer(data))

// 	var body interface{}
// 	if err := json.Unmarshal(data, &body); err != nil {
// 		h.logger.Errorf("error: %v", err)
// 	}

// 	file, err := json.MarshalIndent(body, "", "  ")
// 	if err != nil {
// 		h.logger.Errorf("error: %v", err)
// 	}

// 	now := time.Now().Format(time.RFC3339)

// 	if err := fs.MakeDir(filepath.Join(dir, now)); err != nil {
// 		h.logger.Errorf("error: %v", err)
// 	}

// 	filePath := filepath.Join(dir, now, "webhook.json")
// 	headersPath := filepath.Join(dir, now, "headers.txt")

// 	err = ioutil.WriteFile(filePath, file, 0644)
// 	if err != nil {
// 		h.logger.Errorf("error: %v", err)
// 	}

// 	var header string
// 	for h, v := range headers {
// 		for _, v := range v {
// 			header += fmt.Sprintf("%s %s\n", h, v)
// 		}
// 	}
// 	err = ioutil.WriteFile(headersPath, []byte(header), 0644)
// 	if err != nil {
// 		h.logger.Errorf("error: %v", err)
// 	}

// 	render.JSON(w, http.StatusOK, render.Empty{})
// })
