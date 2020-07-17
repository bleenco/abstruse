package repository

import (
	"context"
	"fmt"

	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/pkg/scm"
	"github.com/bleenco/abstruse/server/db"
	"github.com/bleenco/abstruse/server/db/model"
	goscm "github.com/drone/go-scm/scm"
)

// ProviderRepo repository.
type ProviderRepo struct {
	repoRepository RepoRepository
}

// NewProviderRepo returns new ProviderRepo instance.
func NewProviderRepo() ProviderRepo {
	return ProviderRepo{
		repoRepository: NewRepoRepository(),
	}
}

// Find finds providers by userID.
func (r ProviderRepo) Find(userID uint) ([]model.Provider, error) {
	var providers []model.Provider
	db, err := db.Instance()
	if err != nil {
		return providers, err
	}
	err = db.Where("user_id = ?", userID).Find(&providers).Error
	return providers, err
}

// FindByID find provider by ID.
func (r ProviderRepo) FindByID(providerID, userID uint) (model.Provider, error) {
	var provider model.Provider
	db, err := db.Instance()
	if err != nil {
		return provider, err
	}
	err = db.Where("id = ? AND user_id = ?", providerID, userID).First(&provider).Error
	return provider, err
}

// Create inserts new provider into db.
func (r ProviderRepo) Create(data model.Provider) (model.Provider, error) {
	db, err := db.Instance()
	if err != nil {
		return data, err
	}
	err = db.Create(&data).Error
	return data, err
}

// Update updates provider.
func (r ProviderRepo) Update(data model.Provider) (model.Provider, error) {
	db, err := db.Instance()
	if err != nil {
		return data, err
	}
	err = db.Model(&data).Updates(data).Error
	return data, err
}

// Sync synchronizes provider repositories with local repositories.
func (r ProviderRepo) Sync(providerID, userID uint) error {
	page := 1
	size := 30

	provider, err := r.FindByID(providerID, userID)
	if err != nil {
		return err
	}

	for {
		repos, err := r.findRepos(providerID, userID, page, size)
		if err != nil {
			break
		}

		for _, repo := range repos {
			data, permission := convertRepo(repo)
			data.ProviderName = provider.Name
			data.ProviderID = provider.ID
			data.UserID = userID
			if permission.Admin {
				if _, err := r.repoRepository.CreateOrUpdate(data); err != nil {
					return err
				}
			}
		}

		if len(repos) == size {
			page++
		} else {
			break
		}
	}

	provider.LastSync = lib.TimeNow()
	_, err = r.Update(provider)
	return err
}

// findRepos finds SCM providers repositories.
func (r ProviderRepo) findRepos(providerID, userID uint, page, size int) ([]*goscm.Repository, error) {
	var repos []*goscm.Repository
	var err error

	provider, err := r.FindByID(providerID, userID)
	if err != nil {
		return repos, err
	}
	scm, err := scm.NewSCM(context.Background(), provider.Name, provider.URL, provider.AccessToken)
	if err != nil {
		return repos, err
	}
	repos, err = scm.ListRepos(page, size)
	return repos, err
}

func convertRepo(repo *goscm.Repository) (model.Repository, Permission) {
	r := model.Repository{
		UID:           repo.ID,
		Namespace:     repo.Namespace,
		Name:          repo.Name,
		FullName:      fmt.Sprintf("%s/%s", repo.Namespace, repo.Name),
		Private:       repo.Private,
		URL:           repo.Link,
		Clone:         repo.Clone,
		CloneSSH:      repo.CloneSSH,
		DefaultBranch: repo.Branch,
	}
	perm := Permission{
		Pull:  repo.Perm.Pull,
		Push:  repo.Perm.Push,
		Admin: repo.Perm.Admin,
	}

	return r, perm
}

// Permission SCM Repository permissions.
type Permission struct {
	Pull  bool `json:"pull"`
	Push  bool `json:"push"`
	Admin bool `json:"admin"`
}
