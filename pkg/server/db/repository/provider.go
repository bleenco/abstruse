package repository

import (
	"time"

	"github.com/jinzhu/gorm"
	"github.com/jkuri/abstruse/pkg/server/db/model"
)

// ProviderRepository interface.
type ProviderRepository interface {
	List(userID uint) ([]model.Provider, error)
	Create(data ProviderForm) (*model.Provider, error)
	Update(data ProviderForm) (*model.Provider, error)
	Find(providerID, userID uint) (*model.Provider, error)
}

type (
	// ProviderForm create data.
	ProviderForm struct {
		ID          uint   `json:"id"`
		Name        string `json:"name"`
		URL         string `json:"url"`
		AccessToken string `json:"accessToken"`
		Secret      string `json:"secret"`
		UserID      uint   `json:"userId"`
	}

	// SCMRepository scm result.
	SCMRepository struct {
		ID         string      `json:"id"`
		Namespace  string      `json:"namespace"`
		Name       string      `json:"name"`
		Permission *Permission `json:"permission"`
		Branch     string      `json:"branch"`
		Private    bool        `json:"private"`
		Clone      string      `json:"clone"`
		CloneSSH   string      `json:"close_ssh"`
		Link       string      `json:"link"`
		Created    time.Time   `json:"created"`
		Updated    time.Time   `json:"updated"`
	}

	// Permission scm result.
	Permission struct {
		Pull  bool `json:"pull"`
		Push  bool `json:"push"`
		Admin bool `json:"admin"`
	}
)

// DBProviderRepository struct.
type DBProviderRepository struct {
	db *gorm.DB
}

// NewDBProviderRepository returns new DBProviderRepository instance.
func NewDBProviderRepository(db *gorm.DB) ProviderRepository {
	return &DBProviderRepository{db}
}

// List returns list of providers for specified user.
func (r *DBProviderRepository) List(userID uint) ([]model.Provider, error) {
	var providers []model.Provider
	err := r.db.Where("user_id = ?", userID).Find(&providers).Error
	return providers, err
}

// Create creates new provider.
func (r *DBProviderRepository) Create(data ProviderForm) (*model.Provider, error) {
	provider := &model.Provider{
		Name:        data.Name,
		URL:         data.URL,
		AccessToken: data.AccessToken,
		Secret:      data.Secret,
		UserID:      data.UserID,
	}
	provider.CreatedAt = time.Now()
	provider.UpdatedAt = time.Now()
	err := r.db.Create(provider).Error
	return provider, err
}

// Update updates provider data.
func (r *DBProviderRepository) Update(data ProviderForm) (*model.Provider, error) {
	provider := &model.Provider{}
	err := r.db.Where("id = ? AND user_id = ?", data.ID, data.UserID).First(provider).Error
	if err != nil {
		return nil, err
	}
	accessToken := provider.AccessToken
	if data.AccessToken != "" {
		accessToken = data.AccessToken
	}
	err = r.db.Model(provider).Updates(model.Provider{Name: data.Name, AccessToken: accessToken, URL: data.URL, Secret: data.Secret}).Error
	if err != nil {
		return nil, err
	}
	return provider, err
}

// Find provider by id.
func (r *DBProviderRepository) Find(providerID, userID uint) (*model.Provider, error) {
	provider := &model.Provider{}
	err := r.db.Preload("User").Where("id = ? AND user_id = ?", providerID, userID).First(provider).Error
	return provider, err
}
