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
	br.StartTime = func(t time.Time) *time.Time { return &t }(time.Now())

	return DB.Create(br).Error
}

// Update method.
func (br *BuildRun) Update() error {
	return DB.Model(br).Updates(map[string]interface{}{"end_time": func(t time.Time) *time.Time { return &t }(time.Now())}).Error
}

// Find method.
func (br *BuildRun) Find(id int) error {
	return DB.Find(br, id).Error
}
