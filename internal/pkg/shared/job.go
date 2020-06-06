package shared

import (
	"time"

	jsoniter "github.com/json-iterator/go"
)

// Status defines job status.
type Status int

const (
	// StatusUnknown unknown job status.
	StatusUnknown Status = iota
	// StatusQueued job is queued.
	StatusQueued
	// StatusRunning job is running.
	StatusRunning
	// StatusPassing job finished with success, exit code 0.
	StatusPassing
	// StatusFailing job finished with error, exit code != 0
	StatusFailing
)

// Job defines build job/task stored in etcd.
type Job struct {
	ID            uint      `json:"id"`
	BuildID       uint      `json:"build_id"`
	Commands      string    `json:"commands"`
	Image         string    `json:"image"`
	Env           string    `json:"env"`
	ProviderName  string    `json:"provider_name"`
	ProviderURL   string    `json:"provider_url"`
	ProviderToken string    `json:"provider_token"`
	CommitSHA     string    `json:"commit_sha"`
	RepoName      string    `json:"repository_name"`
	Priority      uint16    `json:"priority"`
	Status        Status    `json:"status"`
	WorkerID      string    `json:"worker_id"`
	StartTime     time.Time `json:"start_time"`
	EndTime       time.Time `json:"end_time"`
}

// Marshal encodes to JSON string format.
func (j *Job) Marshal() (string, error) {
	return jsoniter.MarshalToString(&j)
}

// Unmarshal parses data string to struct.
func (j *Job) Unmarshal(data string) (Job, error) {
	err := jsoniter.UnmarshalFromString(data, &j)
	return *j, err
}

// GetStatus returns status in string format.
func (j *Job) GetStatus() string {
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
