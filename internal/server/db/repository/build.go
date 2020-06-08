package repository

import (
	"github.com/jinzhu/gorm"
	"github.com/jkuri/abstruse/internal/server/db/model"
)

// BuildRepository interface.
type BuildRepository interface {
	Find(id uint) (model.Build, error)
	FindAll(id uint) (model.Build, error)
	FindBuilds(limit, offset int) ([]model.Build, error)
	FindByRepoID(repoID uint, limit, offset int) ([]model.Build, error)
	Create(data model.Build) (model.Build, error)
	Update(data model.Build) (model.Build, error)
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
	err := r.db.Preload("Jobs").Preload("Repository.Provider").Find(&build, id).Error
	return build, err
}

// FindBuilds returns builds by user id with preloaded jobs and repo data.
func (r *DBBuildRepository) FindBuilds(limit, offset int) ([]model.Build, error) {
	var builds []model.Build
	err := r.db.Preload(("Jobs")).Preload("Repository").Order("created_at desc").Limit(limit).Offset(offset).Find(&builds).Error
	return builds, err
}

// FindByRepoID returns builds by repo id with preloaded jobs and repo data.
func (r *DBBuildRepository) FindByRepoID(repoID uint, limit, offset int) ([]model.Build, error) {
	var builds []model.Build
	err := r.db.Preload("Jobs").Preload("Repository").Where("repository_id = ?", repoID).Order("created_at desc").Limit(limit).Offset(offset).Find(&builds).Error
	return builds, err
}

// Create inserts new build and returns inserted item.
func (r *DBBuildRepository) Create(data model.Build) (model.Build, error) {
	err := r.db.Create(&data).Error
	return data, err
}

// Update updates build.
func (r *DBBuildRepository) Update(data model.Build) (model.Build, error) {
	err := r.db.Model(&data).Updates(map[string]interface{}{"start_time": data.StartTime, "end_time": data.EndTime}).Error
	return data, err
}
