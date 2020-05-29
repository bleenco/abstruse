package repository

import (
	"github.com/jinzhu/gorm"
	"github.com/jkuri/abstruse/internal/server/db/model"
)

// BuildRepository interface.
type BuildRepository interface {
	Find(id uint) (model.Build, error)
	FindAll(id uint) (model.Build, error)
	FindByRepoID(repoID uint, limit, offset int) ([]model.Build, error)
}

// DBBuildRepository struct.
type DBBuildRepository struct {
	db *gorm.DB
}

// NewDBBuildRepository returns new instance of BuildRepository.
func NewDBBuildRepository(db *gorm.DB) BuildRepository {
	return &DBBuildRepository{db}
}

// Find returns build by id.
func (r *DBBuildRepository) Find(id uint) (model.Build, error) {
	build := model.Build{}
	err := r.db.Find(&build, id).Error
	return build, err
}

// FindAll returns build with preloaded jobs and repository data.
func (r *DBBuildRepository) FindAll(id uint) (model.Build, error) {
	build := model.Build{}
	err := r.db.Preload("Jobs").Preload("Repository").Find(&build, id).Error
	return build, err
}

// FindByRepoID returns builds by repo id with preloaded jobs and repo data.
func (r *DBBuildRepository) FindByRepoID(repoID uint, limit, offset int) ([]model.Build, error) {
	var builds []model.Build
	err := r.db.Preload("Jobs").Preload("Repository").Where("repository_id = ?", repoID).Order("created_at desc").Limit(limit).Offset(offset).Find(&builds).Error
	return builds, err
}
