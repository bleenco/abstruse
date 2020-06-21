package repository

import (
	"fmt"

	"github.com/jinzhu/gorm"
	"github.com/jkuri/abstruse/pkg/server/db/model"
)

// RepoRepository struct.
type RepoRepository struct {
	db *gorm.DB
}

// NewRepoRepository func.
func NewRepoRepository(db *gorm.DB) RepoRepository {
	return RepoRepository{db}
}

// Find returns repo by id.
func (r *RepoRepository) Find(id, userID uint) (*model.Repository, error) {
	repo := &model.Repository{}
	if err := r.db.Model(repo).Where("id = ? AND user_id = ?", id, userID).Preload("Provider").First(repo).Error; err != nil {
		return nil, err
	}
	return repo, nil
}

// FindByURL returns repo by url.
func (r *RepoRepository) FindByURL(url string) (model.Repository, error) {
	var repo model.Repository
	err := r.db.Model(&repo).Where("url = ?", url).Preload("Provider").First(&repo).Error
	return repo, err
}

// List returns list of repositories by user_id.
func (r *RepoRepository) List(UserID uint) ([]model.Repository, error) {
	var repos []model.Repository
	err := r.db.Where("user_id = ?", UserID).Find(&repos).Error
	return repos, err
}

// Search returns list of repositories based by keyword searched.
func (r *RepoRepository) Search(keyword string) ([]model.Repository, error) {
	var repos []model.Repository
	err := r.db.Where("full_name LIKE ?", fmt.Sprintf("%%%s%%", keyword)).Preload("Provider").Find(&repos).Error
	return repos, err
}

// Create new repository.
func (r *RepoRepository) Create(data SCMRepository, provider *model.Provider) (*model.Repository, error) {
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
