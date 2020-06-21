package repository

import (
	"github.com/jinzhu/gorm"
	"github.com/jkuri/abstruse/pkg/server/db/model"
)

// BuildRepository struct.
type BuildRepository struct {
	db *gorm.DB
}

// NewBuildRepository returns new instance of BuildRepository.
func NewBuildRepository(db *gorm.DB) BuildRepository {
	return BuildRepository{db}
}

// Find returns build by id.
func (r *BuildRepository) Find(id uint) (model.Build, error) {
	build := model.Build{}
	err := r.db.Find(&build, id).Error
	return build, err
}

// FindAll returns build with preloaded jobs and repository data.
func (r *BuildRepository) FindAll(id uint) (model.Build, error) {
	build := model.Build{}
	err := r.db.Preload("Jobs").Preload("Repository.Provider").Find(&build, id).Error
	return build, err
}

// FindBuilds returns builds by user id with preloaded jobs and repo data.
func (r *BuildRepository) FindBuilds(limit, offset int) ([]model.Build, error) {
	var builds []model.Build
	err := r.db.Preload("Jobs").Preload("Repository").Order("created_at desc").Limit(limit).Offset(offset).Find(&builds).Error
	return builds, err
}

// FindByRepoID returns builds by repo id with preloaded jobs and repo data.
func (r *BuildRepository) FindByRepoID(repoID uint, limit, offset int) ([]model.Build, error) {
	var builds []model.Build
	err := r.db.Preload("Jobs").Preload("Repository").Where("repository_id = ?", repoID).Order("created_at desc").Limit(limit).Offset(offset).Find(&builds).Error
	return builds, err
}

// Create inserts new build and returns inserted item.
func (r *BuildRepository) Create(data model.Build) (model.Build, error) {
	err := r.db.Create(&data).Error
	if err != nil {
		return data, err
	}
	return r.FindAll(data.ID)
}

// Update updates build.
func (r *BuildRepository) Update(data model.Build) (model.Build, error) {
	err := r.db.Model(&data).Updates(map[string]interface{}{"start_time": data.StartTime, "end_time": data.EndTime}).Error
	return data, err
}
