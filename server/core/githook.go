package core

import (
	"net/http"
	"time"
)

// Hook action constants.
const (
	ActionOpen   = "open"
	ActionClose  = "close"
	ActionCreate = "create"
	ActionDelete = "delete"
	ActionSync   = "sync"
)

// Hook event constants.
const (
	EventPush        = "push"
	EventPullRequest = "pull_request"
	EventTag         = "tag"
)

type (
	// GitHook represents the payload of a post-commit scm hook.
	GitHook struct {
		Event        string    `json:"event"`
		Action       string    `json:"action"`
		Link         string    `json:"link"`
		Timestamp    time.Time `json:"timestamp"`
		Title        string    `json:"title"`
		Message      string    `json:"message"`
		Before       string    `json:"before"`
		After        string    `json:"after"`
		Ref          string    `json:"ref"`
		Fork         string    `json:"hook"`
		Source       string    `json:"source"`
		Target       string    `json:"target"`
		AuthorEmail  string    `json:"author_email"`
		AuthorAvatar string    `json:"author_avatar"`
		AuthorName   string    `json:"author_name"`
		AuthorLogin  string    `json:"author_login"`
		SenderEmail  string    `json:"sender_email"`
		SenderName   string    `json:"sender_name"`
		SenderAvatar string    `json:"sender_avatar"`
		SenderLogin  string    `json:"sender_login"`
	}

	// GitHookParser parses a post-commit hook from the SCM
	// and returns mapped data.
	GitHookParser interface {
		Parse(req *http.Request, secretFunc func(string) *Repository) (*GitHook, *Repository, error)
	}
)
