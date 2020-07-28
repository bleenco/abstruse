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

// Find finds repositories by userID.
func (r RepoRepository) Find(userID uint, limit, offset int, keyword string) ([]model.Repository, int, error) {
	var repos []model.Repository
	var count int
	db, err := db.Instance()
	if err != nil {
		return repos, count, err
	}
	if keyword == "" {
		err = db.Limit(limit).Offset(offset).Where("user_id = ?", userID).Order("active desc, name asc").Find(&repos).Error
		if err != nil {
			return repos, count, err
		}
		err = db.Model(&model.Repository{}).Where("user_id = ?", userID).Order("active desc, name asc").Count(&count).Error
		return repos, count, err
	}
	err = db.Limit(limit).Offset(offset).Where("user_id = ? AND fullname LIKE ?", userID, fmt.Sprintf("%%%s%%", keyword)).Order("active desc, name asc").Find(&repos).Error
	if err != nil {
		return repos, count, err
	}
	err = db.Model(&model.Repository{}).Where("user_id = ?", userID).Order("active desc, name asc").Count(&count).Error
	return repos, count, err
}

// FindByID finds repository by ID.
func (r RepoRepository) FindByID(repoID, userID uint) (model.Repository, error) {
	var repo model.Repository
	db, err := db.Instance()
	if err != nil {
		return repo, err
	}
	err = db.Where("id = ? AND user_id = ?", repoID, userID).Preload("Provider").First(&repo).Error
	return repo, err
}

// FindByURL returns repo by url.
func (r RepoRepository) FindByURL(url string) (model.Repository, error) {
	var repo model.Repository
	db, err := db.Instance()
	if err != nil {
		return repo, err
	}
	err = db.Model(&repo).Where("url = ?", url).Preload("Provider").First(&repo).Error
	return repo, err
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
