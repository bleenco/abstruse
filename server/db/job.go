package db

import "time"

// Job defines `jobs` database table.
type Job struct {
	BaseModel

	Commands string `sql:"type:text" json:"commands"`
	Image    string `json:"image"`
	Env      string `json:"env"`

	Build   Build `json:"build"`
	BuildID uint  `json:"build_id"`
}

// Create method.
func (j *Job) Create() error {
	j.UpdatedAt = time.Now()
	j.CreatedAt = time.Now()

	return DB.Create(j).Error
}

// Update method.
func (j *Job) Update() error {
	return DB.Model(j).Updates(map[string]interface{}{"updated_at": time.Now()}).Error
}

// Find method.
func (j *Job) Find(id int) error {
	return DB.Find(j, id).Error
}
