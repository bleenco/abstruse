package repository

import (
	"github.com/jinzhu/gorm"
	"github.com/jkuri/abstruse/internal/server/db/model"
)

// RepoRepository interface.
type RepoRepository interface {
	Find(ID uint) (*model.Repository, error)
	List(UserID uint) ([]model.Repository, error)
}

// DBRepoRepository struct.
type DBRepoRepository struct {
	db *gorm.DB
}

// NewDBRepoRepository func.
func NewDBRepoRepository(db *gorm.DB) RepoRepository {
	return &DBRepoRepository{db}
}

// Find returns repo by id.
func (r *DBRepoRepository) Find(ID uint) (*model.Repository, error) {
	repo := &model.Repository{}
	if err := r.db.Model(repo).Where("id = ?", ID).First(repo).Error; err != nil {
		return nil, err
	}
	return repo, nil
}

// List returns list of repositories by user_id.
func (r *DBRepoRepository) List(UserID uint) ([]model.Repository, error) {
	var repos []model.Repository
	err := r.db.Where("user_id = ?", UserID).Find(&repos).Error
	return repos, err
}
