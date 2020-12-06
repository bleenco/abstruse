package core

import "time"

type (
	// Build defines `builds` database table.
	Build struct {
		ID              uint        `gorm:"primary_key;auto_increment;not null" json:"id"`
		Branch          string      `json:"branch"`
		Commit          string      `json:"commit"`
		CommitMessage   string      `json:"commitMessage"`
		Ref             string      `gorm:"default:'refs/heads/master'" json:"ref"`
		PR              int         `json:"pr"`
		PRTitle         string      `json:"prTitle"`
		PRBody          string      `json:"pr_body"`
		Config          string      `sql:"type:text" json:"config"`
		AuthorLogin     string      `json:"authorLogin"`
		AuthorName      string      `json:"authorName"`
		AuthorEmail     string      `json:"authorEmail"`
		AuthorAvatar    string      `gorm:"default:'/assets/images/avatars/avatar_1.svg'" json:"authorAvatar"`
		CommitterLogin  string      `json:"committerLogin"`
		CommitterName   string      `json:"committerName"`
		CommitterEmail  string      `json:"committerEmail"`
		CommitterAvatar string      `gorm:"default:'/assets/images/avatars/avatar_1.svg'" json:"committerAvatar"`
		StartTime       *time.Time  `json:"startTime"`
		EndTime         *time.Time  `json:"endTime"`
		Jobs            []*Job      `gorm:"preload:false" json:"jobs,omitempty"`
		Repository      *Repository `gorm:"preload:false" json:"repository,omitempty"`
		RepositoryID    uint        `json:"repositoryID"`
		Timestamp
	}

	// BuildFilter defines filters used to return list of builds.
	BuildFilter struct {
		Limit        int
		Offset       int
		RepositoryID int
		Kind         string
	}

	// BuildStore defines methods to work with builds
	BuildStore interface {
		// Find returns build by id from datastore.
		Find(uint) (*Build, error)

		// List returns list of builds from datastore
		List(BuildFilter) ([]*Build, error)

		// Create persists build to the datastore.
		Create(*Build) error

		// Update persist updated build to the datastore.
		Update(*Build) error

		// Delete deletes build from the datastore.
		Delete(*Build) error

		// TriggerBuild creates new build and returns associated jobs.
		TriggerBuild(uint) ([]*Job, error)

		// GenerateBuild generates and triggers build based on post-commit hook.
		GenerateBuild(repo *Repository, base *GitHook) ([]*Job, uint, error)
	}
)
