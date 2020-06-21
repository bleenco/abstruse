package model

import "time"

// Repository defines `repositories` db table.
type Repository struct {
	ID            uint   `gorm:"primary_key;auto_increment;not null" json:"id"`
	UID           string `gorm:"not null" json:"uid"`
	ProviderName  string `gorm:"not null" json:"provider_name"`
	Namespace     string `gorm:"not null" json:"namespace"`
	Name          string `gorm:"not null;varchar(255)" json:"name"`
	FullName      string `gorm:"not null;varchar(255)" json:"full_name"`
	Private       bool   `json:"private"`
	Fork          bool   `json:"fork"`
	URL           string `json:"url"`
	GitURL        string `json:"git_url"`
	DefaultBranch string `json:"default_branch"`
	Visibility    string `json:"visibility"`
	TimestampModel
	UserID     uint     `json:"user_id"`
	User       User     `json:"-"`
	ProviderID uint     `gorm:"not null" json:"provider_id"`
	Provider   Provider `json:"-"`
}

// TableName is name that is used in db.
func (Repository) TableName() string {
	return "repositories"
}

// BeforeCreate hook.
func (r *Repository) BeforeCreate() (err error) {
	r.CreatedAt = time.Now()
	r.UpdatedAt = time.Now()
	return
}

// BeforeUpdate hook.
func (r *Repository) BeforeUpdate() (err error) {
	r.UpdatedAt = time.Now()
	return
}
