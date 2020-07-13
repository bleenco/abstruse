package repository

import (
	"context"
	"time"

	"github.com/bleenco/abstruse/pkg/scm"
	"github.com/bleenco/abstruse/server/db"
	"github.com/bleenco/abstruse/server/db/model"
	goscm "github.com/drone/go-scm/scm"
)

// ProviderRepo repository.
type ProviderRepo struct{}

// NewProviderRepo returns new ProviderRepo instance.
func NewProviderRepo() ProviderRepo {
	return ProviderRepo{}
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

// FindRepos finds SCM providers repositories.
func (r ProviderRepo) FindRepos(providerID, userID uint, page, size int) ([]SCMRepository, error) {
	var repos []SCMRepository
	provider, err := r.FindByID(providerID, userID)
	if err != nil {
		return repos, err
	}
	scm, err := scm.NewSCM(context.Background(), provider.Name, provider.URL, provider.AccessToken)
	if err != nil {
		return repos, err
	}
	repositories, err := scm.ListRepos(page, size)
	if err != nil {
		return repos, err
	}
	for _, repo := range repositories {
		repos = append(repos, convertRepo(repo))
	}
	return repos, nil
}

func convertRepo(repo *goscm.Repository) SCMRepository {
	perm := &Permission{
		Pull:  repo.Perm.Pull,
		Push:  repo.Perm.Push,
		Admin: repo.Perm.Admin,
	}
	return SCMRepository{
		ID:         repo.ID,
		Namespace:  repo.Namespace,
		Name:       repo.Name,
		Permission: perm,
		Branch:     repo.Branch,
		Private:    repo.Private,
		Clone:      repo.Clone,
		CloneSSH:   repo.CloneSSH,
		Link:       repo.Link,
		Created:    repo.Created,
		Updated:    repo.Updated,
	}
}

type (
	// SCMRepository scm result.
	SCMRepository struct {
		ID         string      `json:"id"`
		Namespace  string      `json:"namespace"`
		Name       string      `json:"name"`
		Permission *Permission `json:"permission"`
		Branch     string      `json:"branch"`
		Private    bool        `json:"private"`
		Clone      string      `json:"clone"`
		CloneSSH   string      `json:"cloneSSH"`
		Link       string      `json:"link"`
		Created    time.Time   `json:"createdAt"`
		Updated    time.Time   `json:"updatedAt"`
	}

	// Permission scm result.
	Permission struct {
		Pull  bool `json:"pull"`
		Push  bool `json:"push"`
		Admin bool `json:"admin"`
	}
)
