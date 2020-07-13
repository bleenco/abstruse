package model

// Repository defines `repositories` db table.
type Repository struct {
	ID            uint   `gorm:"primary_key;auto_increment;not null" json:"id"`
	UID           string `gorm:"not null" json:"uid"`
	ProviderName  string `gorm:"not null" json:"providerName"`
	Namespace     string `gorm:"not null" json:"namespace"`
	Name          string `gorm:"not null;varchar(255)" json:"name"`
	FullName      string `gorm:"not null;varchar(255)" json:"fullName"`
	Private       bool   `json:"private"`
	Fork          bool   `json:"fork"`
	URL           string `json:"url"`
	GitURL        string `json:"gitURL"`
	DefaultBranch string `json:"defaultBranch"`
	Visibility    string `json:"visibility"`
	TimestampModel
	UserID     uint     `json:"userID"`
	User       User     `json:"-"`
	ProviderID uint     `gorm:"not null" json:"providerID"`
	Provider   Provider `json:"-"`
}

// TableName is name that is used in db.
func (Repository) TableName() string {
	return "repositories"
}
