package db

import "time"

// Build defines `builds`database table.
type Build struct {
	BaseModel

	Branch string `json:"branch"`
	PR     string `json:"pr"`
	Commit string `json:"commit"`

	Config string `sql:"type:text" json:"config"`

	StartTime *time.Time `json:"start_time"`
	EndTime   *time.Time `json:"end_time"`

	Repository   Repository `json:"repository"`
	RepositoryID uint       `json:"repository_id"`
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

// FindByRepoID method.
func FindByRepoID(repoID int) ([]Build, error) {
	var builds []Build
	err := DB.Where("repository_id = ?", repoID).Find(&builds).Error
	return builds, err
}
