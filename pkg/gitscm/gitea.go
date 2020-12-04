package gitscm

import (
	"time"

	"github.com/drone/go-scm/scm"
)

func convertCommitInfo(src *commitInfo) *scm.Commit {
	return &scm.Commit{
		Sha:       src.Commit.Tree.Sha,
		Link:      src.Commit.URL,
		Message:   src.Commit.Message,
		Author:    convertUserSignature(src.Author),
		Committer: convertUserSignature(src.Committer),
	}
}

func convertUserSignature(src user) scm.Signature {
	return scm.Signature{
		Login:  userLogin(&src),
		Email:  src.Email,
		Name:   src.Fullname,
		Avatar: src.Avatar,
	}
}

func userLogin(src *user) string {
	if src.Username != "" {
		return src.Username
	}
	return src.Login
}

type (
	// gitea branch object.
	branch struct {
		Name   string `json:"name"`
		Commit commit `json:"commit"`
	}

	// gitea commit object.
	commit struct {
		Message   string     `json:"message"`
		Tree      commitTree `json:"tree"`
		URL       string     `json:"url"`
		Author    signature  `json:"author"`
		Committer signature  `json:"committer"`
		Timestamp time.Time  `json:"timestamp"`
	}

	// gitea commitTree object.
	commitTree struct {
		Sha string `json:"sha"`
		URL string `json:"url"`
	}

	// gitea commit info object.
	commitInfo struct {
		Sha       string `json:"sha"`
		URL       string `json:"url"`
		Commit    commit `json:"commit"`
		Author    user   `json:"author"`
		Committer user   `json:"committer"`
	}

	// gitea signature object.
	signature struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Username string `json:"username"`
	}

	user struct {
		ID       int    `json:"id"`
		Login    string `json:"login"`
		Username string `json:"username"`
		Fullname string `json:"full_name"`
		Email    string `json:"email"`
		Avatar   string `json:"avatar_url"`
	}
)
