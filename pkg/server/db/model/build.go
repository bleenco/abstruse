package model

import "time"

// Build defines `builds` database table.
type Build struct {
	ID              uint       `gorm:"PRIMARY_KEY;AUTO_INCREMENT;NOT NULL" json:"id"`
	Branch          string     `json:"branch"`
	Commit          string     `json:"commit"`
	CommitMessage   string     `json:"commit_message"`
	Ref             string     `gorm:"default:'refs/heads/master'" json:"ref"`
	PR              int        `json:"pr"`
	PRTitle         string     `json:"pr_title"`
	PRBody          string     `json:"pr_body"`
	Config          string     `sql:"type:text" json:"config"`
	AuthorLogin     string     `json:"author_login"`
	AuthorName      string     `json:"author_name"`
	AuthorEmail     string     `json:"author_email"`
	AuthorAvatar    string     `gorm:"default:'/assets/images/avatars/predefined/avatar_1.svg'" json:"author_avatar"`
	CommitterLogin  string     `json:"committer_login"`
	CommitterName   string     `json:"committer_name"`
	CommitterEmail  string     `json:"committer_email"`
	CommitterAvatar string     `gorm:"default:'/assets/images/avatars/predefined/avatar_1.svg'" json:"committer_avatar"`
	StartTime       *time.Time `json:"start_time"`
	EndTime         *time.Time `json:"end_time"`
	TimestampModel
	Jobs         []*Job      `gorm:"PRELOAD:false" json:"jobs,omitempty"`
	Repository   *Repository `gorm:"PRELOAD:false" json:"repository,omitempty"`
	RepositoryID uint        `json:"repository_id"`
}
