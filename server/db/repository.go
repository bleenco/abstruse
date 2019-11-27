package db

import "fmt"
import "time"

// Repository represents `repositories` db table.
type Repository struct {
	BaseModel

	ProviderID    int    `json:"provider_id"`
	Provider      string `json:"provider"`
	Name          string `json:"name"`
	FullName      string `json:"full_name"`
	URL           string `json:"url"`
	HTMLURL       string `json:"html_url"`
	GitURL        string `json:"git_url"`
	Description   string `json:"description"`
	Homepage      string `json:"homepage"`
	DefaultBranch string `json:"default_branch"`
	MasterBranch  string `json:"master_branch"`
	Language      string `json:"language"`
	Fork          bool   `json:"fork"`
	Size          int    `json:"size"`

	User   User `json:"-"`
	UserID uint `json:"-"`

	Integration   Integration `json:"-"`
	IntegrationID uint        `json:"-"`
}

// TableName method.
func (Repository) TableName() string {
	return "repositories"
}

// Create method.
func (r *Repository) Create() error {
	r.UpdatedAt = time.Now()
	r.CreatedAt = time.Now()

	return DB.Create(r).Error
}

// Find method.
func (r *Repository) Find(id int) error {
	return DB.Preload("User").Find(r, id).Error
}

// FindRepositories method.
func FindRepositories(userID int, order string) ([]Repository, error) {
	var repos []Repository

	fmt.Println(order)

	err := DB.Where("user_id = ?", userID).Order(order).Find(&repos).Error
	return repos, err
}
