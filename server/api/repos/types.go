package repos

import (
	"time"
)

// RepoType defines Repo structure.
type RepoType struct {
	ID uint `json:"id"`

	Name string `json:"name"`
	FullName string `json:"full_name"`
	URL string `json:"url"`
	GitURL string `json:"git_url"`
	Homepage string `json:"homepage"`
	HTMLURL string `json:"html_url"`
	Language string `json:"language"`
	Description string `json:"description"`

	Fork bool `json:"fork"`
	DefaultBranch string `json:"default_branch"`
	MasterBranch string `json:"master_branch"`

	Provider string `json:"provider"`
	ProviderID int `json:"provider_id"`

	Size int `json:"size"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}