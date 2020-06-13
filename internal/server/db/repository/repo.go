package repository

import (
	"fmt"

	"github.com/jinzhu/gorm"
	"github.com/jkuri/abstruse/internal/server/db/model"
)

// RepoRepository interface.
type RepoRepository interface {
	Find(id, userID uint) (*model.Repository, error)
	List(UserID uint) ([]model.Repository, error)
	Search(keyword string) ([]model.Repository, error)
	Create(data SCMRepository, provider *model.Provider) (*model.Repository, error)
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
func (r *DBRepoRepository) Find(id, userID uint) (*model.Repository, error) {
	repo := &model.Repository{}
	if err := r.db.Model(repo).Where("id = ? AND user_id = ?", id, userID).Preload("Provider").First(repo).Error; err != nil {
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

// Search returns list of repositories based by keyword searched.
func (r *DBRepoRepository) Search(keyword string) ([]model.Repository, error) {
	var repos []model.Repository
	err := r.db.Where("full_name LIKE ?", fmt.Sprintf("%%%s%%", keyword)).Preload("Provider").Find(&repos).Error
	return repos, err
}

// Create new repository.
func (r *DBRepoRepository) Create(data SCMRepository, provider *model.Provider) (*model.Repository, error) {
	repo := &model.Repository{
		UID:           data.ID,
		ProviderName:  provider.Name,
		Namespace:     data.Namespace,
		Name:          data.Name,
		FullName:      fmt.Sprintf("%s/%s", data.Namespace, data.Name),
		Private:       data.Private,
		URL:           data.Clone,
		GitURL:        data.CloneSSH,
		DefaultBranch: data.Branch,
		UserID:        provider.UserID,
		ProviderID:    provider.ID,
	}
	err := r.db.Create(repo).Error
	return repo, err
}
