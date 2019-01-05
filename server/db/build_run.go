package db

import "time"

// BuildRun defines `build_runs` database table.
type BuildRun struct {
	BaseModel

	StartTime *time.Time `json:"start_time"`
	EndTime   *time.Time `json:"end_time"`

	Build   Build `json:"build"`
	BuildID uint  `json:"build_id"`
}

// Create method.
func (br *BuildRun) Create() error {
	br.UpdatedAt = time.Now()
	br.CreatedAt = time.Now()

	return DB.Create(br).Error
}

// Find method.
func (br *BuildRun) Find(id int) error {
	return DB.Find(br, id).Error
}
