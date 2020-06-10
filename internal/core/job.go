package core

import "time"

// JobStatus defines job status.
type JobStatus int

const (
	// StatusUnknown unknown job status.
	StatusUnknown JobStatus = iota
	// StatusQueued job is queued.
	StatusQueued
	// StatusRunning job is running.
	StatusRunning
	// StatusPassing job finished with success, exit code 0.
	StatusPassing
	// StatusFailing job finished with error, exit code != 0
	StatusFailing
)

// Job defines task for execution.
type Job struct {
	ID            uint      `json:"id"`
	BuildID       uint      `json:"build_id"`
	RepoID        uint      `json:"repo_id"`
	Name          string    `json:"name"`
	Commands      string    `json:"commands"`
	Image         string    `json:"image"`
	Env           string    `json:"env"`
	ProviderName  string    `json:"provider_name"`
	ProviderURL   string    `json:"provider_url"`
	ProviderToken string    `json:"provider_token"`
	CommitSHA     string    `json:"commit_sha"`
	RepoName      string    `json:"repository_name"`
	Priority      uint16    `json:"priority"`
	Status        JobStatus `json:"status"`
	WorkerID      string    `json:"worker_id"`
	Log           []string  `json:"-"`
	StartTime     time.Time `json:"start_time"`
	EndTime       time.Time `json:"end_time"`
}

// GetStatus returns status in string format.
func (j Job) GetStatus() string {
	switch j.Status {
	case StatusQueued:
		return "queued"
	case StatusRunning:
		return "running"
	case StatusPassing:
		return "passing"
	case StatusFailing:
		return "failing"
	case StatusUnknown:
		return "unknown"
	}
	return "unknown"
}
