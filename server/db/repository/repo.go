package repository

import (
	"fmt"

	"github.com/bleenco/abstruse/server/db"
	"github.com/bleenco/abstruse/server/db/model"
)

// RepoRepository repository.
type RepoRepository struct{}

// NewRepoRepository returns new RepositoryRepo instance.
func NewRepoRepository() RepoRepository {
	return RepoRepository{}
}

// Find find repositories by userID.
func (r RepoRepository) Find(userID uint) ([]model.Repository, error) {
	var repos []model.Repository
	db, err := db.Instance()
	if err != nil {
		return repos, err
	}
	err = db.Where("user_id = ?", userID).Find(&repos).Error
	return repos, err
}

// CreateOrUpdate inserts new repository into db or updates it if already exists.
func (r RepoRepository) CreateOrUpdate(data model.Repository) (model.Repository, error) {
	db, err := db.Instance()
	if err != nil {
		return data, err
	}

	if db.Where("uid = ? AND clone = ?", data.UID, data.Clone).First(&data).RecordNotFound() {
		err = db.Create(&data).Error
		return data, err
	}

	err = db.Model(&data).Where("uid = ? AND clone = ?", data.UID, data.Clone).Updates(data).Error
	return data, err
}

// SetActive updates active status.
func (r RepoRepository) SetActive(repoID, userID uint, active bool) error {
	db, err := db.Instance()
	if err != nil {
		return err
	}

	var repo model.Repository
	if db.Where("id = ? AND user_id = ?", repoID, userID).First(&repo).RecordNotFound() {
		return fmt.Errorf("repository not found")
	}

	return db.Model(&repo).Update("active", active).Error
}
