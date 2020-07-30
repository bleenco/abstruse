package webhook

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"net/http"

	"github.com/bleenco/abstruse/server/db/model"
	"github.com/bleenco/abstruse/server/db/repository"
)

var (
	githubHeaders    = []string{"X-GitHub-Delivery", "X-GitHub-Event", "X-Hub-Signature"}
	gitlabHeaders    = []string{"X-Gitlab-Event", "X-Gitlab-Token"}
	giteaHeaders     = []string{"X-Gitea-Delivery", "X-Gitea-Event", "X-Gitea-Signature"}
	gogsHeaders      = []string{"X-Gogs-Delivery", "X-Gogs-Event", "X-Gogs-Signature"}
	bitbucketHeaders = []string{"X-Request-Id", "X-Event-Key", "X-Hub-Signature"}
)

// ParseWebhook parses webhook and returns clone url and providers secret
func ParseWebhook(req *http.Request) (model.Repository, error) {
	var repo model.Repository

	headers := req.Header.Clone()
	data, err := ioutil.ReadAll(req.Body)
	if err != nil {
		return repo, err
	}
	req.Body.Close()
	req.Body = ioutil.NopCloser(bytes.NewBuffer(data))

	var cloneURL string

	if detectGithub(headers) {
		switch req.Header.Get("X-GitHub-Event") {
		case "push":
			var hook githubPushHook
			if err := json.Unmarshal(data, &hook); err != nil {
				return repo, err
			}
			cloneURL = hook.Repository.CloneURL
		case "pull_request":
			var hook githubPullRequestHook
			if err := json.Unmarshal(data, &hook); err != nil {
				return repo, err
			}
			cloneURL = hook.Repository.CloneURL
		case "create":
			var hook githubCreateHook
			if err := json.Unmarshal(data, &hook); err != nil {
				return repo, err
			}
			cloneURL = hook.Repository.CloneURL
		}
	}

	if detectGitea(headers) {
		switch req.Header.Get("X-Gitea-Event") {
		case "push":
			var hook giteaPushHook
			if err := json.Unmarshal(data, &hook); err != nil {
				return repo, err
			}
			cloneURL = hook.Repository.CloneURL
		case "create":
			var hook giteaCreateHook
			if err := json.Unmarshal(data, &hook); err != nil {
				return repo, err
			}
			cloneURL = hook.Repository.CloneURL
		case "pull_request":
			var hook giteaPullRequestHook
			if err := json.Unmarshal(data, &hook); err != nil {
				return repo, err
			}
			cloneURL = hook.Repository.CloneURL
		}
	}

	r := repository.NewRepoRepository()
	return r.FindByClone(cloneURL)
}

func detectGitea(header http.Header) bool {
	return hasHeaders(header, giteaHeaders)
}

func detectGogs(header http.Header) bool {
	return hasHeaders(header, gogsHeaders) && !hasHeaders(header, giteaHeaders)
}

func detectGitlab(header http.Header) bool {
	return hasHeaders(header, gitlabHeaders)
}

func detectBitbucket(header http.Header) bool {
	return hasHeaders(header, bitbucketHeaders)
}

func detectGithub(header http.Header) bool {
	return hasHeaders(header, githubHeaders) && !hasHeaders(header, giteaHeaders) && !hasHeaders(header, gogsHeaders)
}

func hasHeaders(header http.Header, keys []string) bool {
	for _, key := range keys {
		if header.Get(key) == "" {
			return false
		}
	}
	return true
}
