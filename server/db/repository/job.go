package repository

import (
	"github.com/bleenco/abstruse/server/db"
	"github.com/bleenco/abstruse/server/db/model"
)

// JobRepo struct
type JobRepo struct{}

// NewJobRepo returns new instance of JobRepo.
func NewJobRepo() JobRepo {
	return JobRepo{}
}

// Create inserts new job and returns inserted item.
func (r *JobRepo) Create(data *model.Job) (*model.Job, error) {
	db, err := db.Instance()
	if err != nil {
		return nil, err
	}
	err = db.Create(&data).Error
	return data, err
}

// Update updates job data and returns updated model.
func (r *JobRepo) Update(data *model.Job) (*model.Job, error) {
	db, err := db.Instance()
	if err != nil {
		return nil, err
	}
	err = db.Model(data).Updates(map[string]interface{}{"status": data.Status, "start_time": data.StartTime, "end_time": data.EndTime, "log": data.Log}).Error
	return data, err
}

// Find finds job by id.
func (r *JobRepo) Find(id uint) (*model.Job, error) {
	job := &model.Job{}
	db, err := db.Instance()
	if err != nil {
		return job, err
	}
	err = db.Model(job).Where("id = ?", id).Preload("Build.Repository.Provider").First(job).Error
	return job, nil
}
