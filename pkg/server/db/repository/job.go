package repository

import (
	"github.com/jinzhu/gorm"
	"github.com/jkuri/abstruse/pkg/server/db/model"
)

// JobRepository interface.
type JobRepository interface {
	Create(data *model.Job) (*model.Job, error)
	Update(data *model.Job) (*model.Job, error)
	Find(id uint) (*model.Job, error)
}

// DBJobRepository struct
type DBJobRepository struct {
	db *gorm.DB
}

// NewDBJobRepository returns new instance of JobRepository.
func NewDBJobRepository(db *gorm.DB) JobRepository {
	return &DBJobRepository{db}
}

// Create inserts new job and returns inserted item.
func (r *DBJobRepository) Create(data *model.Job) (*model.Job, error) {
	err := r.db.Create(&data).Error
	return data, err
}

// Update updates job data and returns updated model.
func (r *DBJobRepository) Update(data *model.Job) (*model.Job, error) {
	err := r.db.Model(data).Updates(map[string]interface{}{"status": data.Status, "start_time": data.StartTime, "end_time": data.EndTime, "log": data.Log}).Error
	return data, err
}

// Find finds job by id.
func (r *DBJobRepository) Find(id uint) (*model.Job, error) {
	job := &model.Job{}
	if err := r.db.Model(job).Where("id = ?", id).Preload("Build.Repository.Provider").First(job).Error; err != nil {
		return nil, err
	}
	return job, nil
}
