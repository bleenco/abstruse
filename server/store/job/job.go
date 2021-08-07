package job

import (
	"time"

	"github.com/bleenco/abstruse/server/core"
	"github.com/jinzhu/gorm"
)

// New returns new JobStore.
func New(db *gorm.DB, repos core.RepositoryStore) core.JobStore {
	return jobStore{db, repos}
}

type jobStore struct {
	db    *gorm.DB
	repos core.RepositoryStore
}

func (s jobStore) Find(id uint) (*core.Job, error) {
	var job core.Job
	err := s.db.Model(&job).Where("id = ?", id).
		Preload("Build.Repository.Provider").
		Preload("Build.Repository.EnvVariables").
		First(&job).Error
	return &job, err
}

func (s jobStore) FindUser(id, userID uint) (*core.Job, error) {
	var job core.Job
	err := s.db.Model(&job).Where("id = ?", id).
		Preload("Build.Repository.Provider").
		Preload("Build.Repository.EnvVariables").
		First(&job).Error
	if err != nil {
		return &job, err
	}
	job.Build.Repository.Perms = s.repos.GetPermissions(job.Build.RepositoryID, userID)
	return &job, err
}

func (s jobStore) List(from, to time.Time) ([]*core.Job, error) {
	var jobs []*core.Job
	err := s.db.Where("created_at >= ? AND created_at <= ?", from, to).Find(&jobs).Error
	return jobs, err
}

func (s jobStore) Create(job *core.Job) error {
	return s.db.Create(job).Error
}

func (s jobStore) Update(job *core.Job) error {
	log := []byte(job.Log)

	if len(job.Log) > 16777215 {
		job.Log = job.Log[0:16777215]
	}
	err := s.db.Model(job).Updates(map[string]interface{}{
		"status":     job.Status,
		"start_time": job.StartTime,
		"end_time":   job.EndTime,
		"log":        job.Log,
	}).Error

	if err == nil {
		return nil
	}

	if len(log) > 65535 {
		log = log[len(log)-65535:]
		job.Log = string(log)
	}

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
