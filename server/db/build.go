package db

import (
	"time"
)

// Build defines `builds`database table.
type Build struct {
	BaseModel

	Branch        string `json:"branch"`
	Commit        string `json:"commit"`
	CommitMessage string `json:"commit_message"`
	PR            int    `json:"pr"`
	PRTitle       string `json:"pr_title"`

	Config string `sql:"type:text" json:"config"`

	AuthorLogin  string `json:"author_login"`
	AuthorName   string `json:"author_name"`
	AuthorEmail  string `json:"author_email"`
	AuthorAvatar string `gorm:"default:'/assets/images/avatars/predefined/avatar_1.svg'" json:"author_avatar"`

	CommitterLogin  string `json:"committer_login"`
	CommitterName   string `json:"committer_name"`
	CommitterEmail  string `json:"committer_email"`
	CommitterAvatar string `gorm:"default:'/assets/images/avatars/predefined/avatar_1.svg'" json:"committer_avatar"`

	StartTime *time.Time `json:"start_time"`
	EndTime   *time.Time `json:"end_time"`

	Jobs []*Job `gorm:"PRELOAD:false" json:"jobs,omitempty"`

	Repository   *Repository `gorm:"PRELOAD:false" json:"repository,omitempty"`
	RepositoryID uint        `json:"repository_id"`
}

// Create method.
func (b *Build) Create() error {
	b.UpdatedAt = time.Now()
	b.CreatedAt = time.Now()

	return DB.Create(b).Error
}

// Find method.
func (b *Build) Find(id int) error {
	return DB.Find(b, id).Error
}

// UpdateStartTime method.
func (b *Build) UpdateStartTime() error {
	return DB.Model(b).Update("start_time", time.Now()).Error
}

// UpdateEndTime method.
func (b *Build) UpdateEndTime() error {
	return DB.Model(b).Update("end_time", time.Now()).Error
}

// FindAll method.
func (b *Build) FindAll(id int) error {
	return DB.Preload("Jobs").Preload("Repository").Find(b, id).Error
}

// FindCurrentByRepoID method.
func (b *Build) FindCurrentByRepoID(repoID int) error {
	return DB.Preload("Jobs").Preload("Repository").Where("repository_id = ?", repoID).Last(b).Error
}

// FindBuildsByRepoID method.
func FindBuildsByRepoID(repoID int) ([]Build, error) {
	var builds []Build
	err := DB.Preload("Jobs").Preload("Repository").Where("repository_id = ?", repoID).Order("created_at desc").Find(&builds).Error
	return builds, err
}
