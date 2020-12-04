package job

import (
	"github.com/bleenco/abstruse/server/core"
	"github.com/jinzhu/gorm"
)

// New returns new JobStore.
func New(db *gorm.DB) core.JobStore {
	return jobStore{db}
}

type jobStore struct {
	db *gorm.DB
}

func (s jobStore) Find(id uint) (*core.Job, error) {
	var job core.Job
	err := s.db.Model(&job).Where("id = ?", id).Preload("Build.Repository.Provider").First(&job).Error
	return &job, err
}

func (s jobStore) Create(job *core.Job) error {
	return s.db.Create(job).Error
}

func (s jobStore) Update(job *core.Job) error {
	return s.db.Model(job).Updates(map[string]interface{}{
		"status":     job.Status,
		"start_time": job.StartTime,
		"end_time":   job.EndTime,
		"log":        job.Log,
	}).Error
}

func (s jobStore) Delete(job *core.Job) error {
	return s.db.Delete(job).Error
}
