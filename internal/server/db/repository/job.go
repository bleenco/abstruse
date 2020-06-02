package repository

import (
	"github.com/jinzhu/gorm"
	"github.com/jkuri/abstruse/internal/server/db/model"
)

// JobRepository interface.
type JobRepository interface {
	Create(data model.Job) (model.Job, error)
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
func (r *DBJobRepository) Create(data model.Job) (model.Job, error) {
	err := r.db.Create(&data).Error
	return data, err
}
