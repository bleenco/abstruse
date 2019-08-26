package db

import (
	"time"

	"github.com/bleenco/abstruse/pkg/utils"
)

// Job defines `jobs` database table.
type Job struct {
	BaseModel

	Commands string `sql:"type:text" json:"commands"`
	Image    string `json:"image"`
	Env      string `json:"env"`

	StartTime *time.Time `json:"start_time"`
	EndTime   *time.Time `json:"end_time"`

	Status string `gorm:"not null;varchar(20);default:'queued'" json:"status"` // queued | running | passing | failing
	Log    string `sql:"type:text" json:"log"`

	Build   *Build `gorm:"PRELOAD:false" json:"build,omitempty"`
	BuildID uint   `json:"build_id"`
}

// Create method.
func (j *Job) Create() error {
	j.UpdatedAt = time.Now()
	j.CreatedAt = time.Now()

	return DB.Create(j).Error
}

// Update method.
func (j *Job) Update(status, log string, startTime, endTime *time.Time) error {
	data := map[string]interface{}{
		"updated_at": time.Now(),
		"status":     status,
		"log":        log,
	}

	if utils.CheckDBDateTime(startTime) {
		data["start_time"] = startTime
	}

	if utils.CheckDBDateTime(endTime) {
		data["end_time"] = endTime
	}

	return DB.Model(j).Updates(data).Error
}

// Find method.
func (j *Job) Find(id int) error {
	return DB.Preload("Build.Repository").Find(j, id).Error
}
