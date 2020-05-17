package job

import (
	jsoniter "github.com/json-iterator/go"
)

type (
	// Job holds info about build job.
	Job struct {
		ID          int64       `json:"id"`
		Status      string      `json:"build_status"` // queued | running | passing | failing
		CreatedAt   string      `json:"created_at"`
		StartedAt   string      `json:"started_at"`
		FinishedAt  string      `json:"finished_at"`
		Repository  Repository  `json:"repo"`
		Credentials Credentials `json:"credentials"`
	}

	// Repository holds info about repository.
	Repository struct {
		URL     string `json:"url"`
		HTMLUrl string `json:"html_url"`
		GitURL  string `json:"git_url"`
	}

	// Credentials holds info about repository creds.
	Credentials struct {
		Username    string `json:"string"`
		Password    string `json:"password"`
		AccessToken string `json:"access_token"`
	}
)

// ToJSON returns JSON string.
func (j *Job) ToJSON() (string, error) {
	return jsoniter.MarshalToString(&j)
}

// NewJobFromJSON returns new instance of a Job from JSON string.
func NewJobFromJSON(data string) (*Job, error) {
	var job Job
	err := jsoniter.UnmarshalFromString(data, job)
	return &job, err
}
