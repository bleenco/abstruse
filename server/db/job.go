package db

import "time"

// Job defines `jobs` database table.
type Job struct {
	BaseModel

	Data string `sql:"type:text" json:"data"`

	Build   Build `json:"build"`
	BuildID uint  `json:"build_id"`
}

// Create method.
func (j *Job) Create() error {
	j.UpdatedAt = time.Now()
	j.CreatedAt = time.Now()

	return DB.Create(j).Error
}

// Find method.
func (j *Job) Find(id int) error {
	return DB.Find(j, id).Error
}
