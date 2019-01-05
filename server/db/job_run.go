package db

import "time"

// JobRun defines `job_runs` database table.
type JobRun struct {
	BaseModel

	StartTime *time.Time `json:"start_time"`
	EndTime   *time.Time `json:"end_time"`

	Status string `gorm:"not null;varchar(20);default:'queued'" json:"status"`
	Log    string `sql:"type:text" json:"log"`

	Job   Job  `json:"job"`
	JobID uint `json:"job_id"`

	BuildRun   BuildRun `json:"build_run"`
	BuildRunID uint     `json:"build_run_id"`
}

// Create method.
func (j *JobRun) Create() error {
	j.UpdatedAt = time.Now()
	j.CreatedAt = time.Now()

	return DB.Create(j).Error
}

// Find method.
func (j *JobRun) Find(id int) error {
	return DB.Find(j, id).Error
}
