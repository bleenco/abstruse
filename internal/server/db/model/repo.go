package model

// Repository defines `repositories` db table.
type Repository struct {
	ID            uint   `gorm:"primary_key;auto_increment;not null" json:"id"`
	Provider      string `gorm:"not null" json:"provider"`
	ProviderID    string `gorm:"not null" json:"provider_id"`
	Namespace     string `gorm:"not null" json:"namespace"`
	Name          string `gorm:"not null;varchar(255)" json:"name"`
	FullName      string `gorm:"not null;varchar(255)" json:"full_name"`
	Private       bool   `json:"private"`
	HTMLURL       string `json:"html_url"`
	Description   string `json:"description"`
	Fork          bool   `json:"fork"`
	URL           string `json:"url"`
	GitURL        string `json:"git_url"`
	Homepage      string `json:"homepage"`
	Language      string `json:"language"`
	DefaultBranch string `json:"default_branch"`
	Visibility    string `json:"visibility"`
	UserID        uint   `json:"user_id"`
	User          User   `json:"-"`
	TimestampModel
}

// TableName is name that is used in db.
func (Repository) TableName() string {
	return "repositories"
}
