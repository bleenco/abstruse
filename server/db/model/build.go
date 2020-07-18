package model

import "time"

// Build defines `builds` database table.
type Build struct {
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
	AuthorAvatar    string      `gorm:"default:'/assets/images/avatars/predefined/avatar_1.svg'" json:"authorAvatar"`
	CommitterLogin  string      `json:"committerLogin"`
	CommitterName   string      `json:"committerName"`
	CommitterEmail  string      `json:"committerEmail"`
	CommitterAvatar string      `gorm:"default:'/assets/images/avatars/predefined/avatar_1.svg'" json:"committerAvatar"`
	StartTime       *time.Time  `json:"startTime"`
	EndTime         *time.Time  `json:"endTime"`
	Jobs            []*Job      `gorm:"preload:false" json:"jobs,omitempty"`
	Repository      *Repository `gorm:"preload:false" json:"repository,omitempty"`
	RepositoryID    uint        `json:"repositoryID"`
	TimestampModel
}
