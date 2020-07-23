package repository

import (
	"github.com/bleenco/abstruse/server/db"
	"github.com/bleenco/abstruse/server/db/model"
)

// BuildRepo struct.
type BuildRepo struct{}

// NewBuildRepo returns new instance of BuildRepo.
func NewBuildRepo() BuildRepo {
	return BuildRepo{}
}

// Find returns build by id.
func (r *BuildRepo) Find(id uint) (model.Build, error) {
	build := model.Build{}
	db, err := db.Instance()
	if err != nil {
		return build, err
	}
	err = db.Find(&build, id).Error
	return build, err
}

// FindAll returns build with preloaded jobs and repository data.
func (r *BuildRepo) FindAll(id uint) (model.Build, error) {
	build := model.Build{}
	db, err := db.Instance()
	if err != nil {
		return build, err
	}
	err = db.Preload("Jobs").Preload("Repository.Provider").Find(&build, id).Error
	return build, err
}

// FindBuilds returns builds by user id with preloaded jobs and repo data.
func (r *BuildRepo) FindBuilds(limit, offset, repoID int, kind string) ([]model.Build, error) {
	var builds []model.Build
	db, err := db.Instance()
	if err != nil {
		return builds, err
	}

	if repoID > 0 {
		db = db.Where("repository_id = ?", uint(repoID))
	}

	if kind == "pull-requests" {
		db = db.Where("pr != ?", 0)
	} else if kind == "commits" || kind == "branches" {
		db = db.Where("pr = ?", 0)
	}

	err = db.Preload("Jobs").Preload("Repository").Order("created_at desc").Limit(limit).Offset(offset).Find(&builds).Error
	return builds, err
}

// FindByRepoID returns builds by repo id with preloaded jobs and repo data.
func (r *BuildRepo) FindByRepoID(repoID uint, limit, offset int) ([]model.Build, error) {
	var builds []model.Build
	db, err := db.Instance()
	if err != nil {
		return builds, err
	}
	err = db.Preload("Jobs").Preload("Repository").Where("repository_id = ?", repoID).Order("created_at desc").Limit(limit).Offset(offset).Find(&builds).Error
	return builds, err
}

// Create inserts new build and returns inserted item.
func (r *BuildRepo) Create(data model.Build) (model.Build, error) {
	db, err := db.Instance()
	if err != nil {
		return data, err
	}
	err = db.Create(&data).Error
	if err != nil {
		return data, err
	}
	return r.FindAll(data.ID)
}

// Update updates build.
func (r *BuildRepo) Update(data model.Build) (model.Build, error) {
	db, err := db.Instance()
	if err != nil {
		return data, err
	}
	err = db.Model(&data).Updates(map[string]interface{}{"start_time": data.StartTime, "end_time": data.EndTime}).Error
	return data, err
}
