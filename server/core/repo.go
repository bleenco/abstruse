package core

import (
	"fmt"

	"github.com/bleenco/abstruse/pkg/gitscm"
	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/drone/go-scm/scm"
	"github.com/jinzhu/gorm"
)

type (
	// Repository defines `repositories` db table.
	Repository struct {
		ID            uint          `gorm:"primary_key;auto_increment;not null" json:"id"`
		UID           string        `gorm:"not null" json:"uid"`
		ProviderName  string        `gorm:"not null" json:"providerName"`
		Namespace     string        `gorm:"not null" json:"namespace"`
		Name          string        `gorm:"not null;size:255" json:"name"`
		FullName      string        `gorm:"not null;size:255" json:"fullName"`
		Private       bool          `json:"private"`
		Fork          bool          `json:"fork"`
		UseSSH        bool          `gorm:"default:false" json:"useSSH"`
		URL           string        `json:"url"`
		Clone         string        `json:"clone"`
		CloneSSH      string        `json:"cloneSSH"`
		DefaultBranch string        `json:"defaultBranch"`
		Active        bool          `json:"active"`
		Timeout       uint          `gorm:"not null,default:3600"  json:"timeout"`
		Token         string        `gorm:"not null" json:"token"`
		SSHPrivateKey string        `sql:"type:text" json:"-"`
		UserID        uint          `json:"userID"`
		User          User          `json:"-"`
		ProviderID    uint          `gorm:"not null" json:"providerID"`
		Provider      Provider      `json:"-"`
		EnvVariables  []EnvVariable `json:"-"`
		Mounts        []*Mount      `json:"mounts"`
		Platforms     string        `json:"platforms"`
		Perms         Perms         `json:"perms"`
		Timestamp
	}

	// RepositoryFilter defines filters when listing repositories
	// from the datastore.
	RepositoryFilter struct {
		Limit   int
		Offset  int
		Keyword string
		UserID  uint
	}

	// RepositoryStore defines operations on repositories in datastorage.
	RepositoryStore interface {
		// Find returns repository from the datastore.
		Find(uint, uint) (Repository, error)

		// FindUID returns repository from datastore based by uid.
		FindUID(string) (Repository, error)

		// FindClone returns repository by clone URL from the datastore
		FindClone(string) (Repository, error)

		// FindToken returns repository by token.
		FindToken(string) (*Repository, error)

		// List returns list of repositories from the datastore.
		List(RepositoryFilter) ([]Repository, int, error)

		// Create persists a new repository to the datastore.
		Create(Repository) error

		// Update persists updated repository to the datastore.
		Update(Repository) error

		// CreateOrUpdate persists new repository to the datastore
		// if not exists or updates exists one.
		CreateOrUpdate(Repository) error

		// Delete deletes repository from the datastore.
		Delete(Repository) error

		// GetPermissions returns repo permissions based by user id.
		GetPermissions(uint, uint) Perms

		// SetActive persists new active status to the repository in the datastore.
		SetActive(uint, bool) error

		// ListHooks returns webhooks for specified repository.
		ListHooks(uint, uint) ([]*scm.Hook, error)

		// CreateHook creates webhook for specified repository.
		CreateHook(uint, uint, gitscm.HookForm) error

		// DeleteHooks deletes all related webhooks for specified repository
		DeleteHooks(uint, uint) error

		// SetMisc persists miscellaneous settings to the repo datastore.
		SetMisc(id uint, useSSH bool) error

		// UpdateSSHPrivateKey perstsis ssh privat key to the repo datastore.
		UpdateSSHPrivateKey(id uint, key string) error
	}
)

// TableName is name that is used in db.
func (Repository) TableName() string {
	return "repositories"
}

// BeforeCreate hook
func (r *Repository) BeforeCreate(tx *gorm.DB) (err error) {
	r.Token = lib.RandomString()
	if r.Token == "" {
		err = fmt.Errorf("repository must include token")
	}
	r.Timeout = 3600
	return
}
