package db

import "database/sql"

// Permission defines `permissions` table in db.
type Permission struct {
	BaseModel

	Module string `json:"module"`
	Title  string `json:"title"`

	Repository   Repository
	RepositoryID sql.NullInt64

	Read    bool `gorm:"not_null;default:false" json:"read"`
	Write   bool `gorm:"not_null;default:false" json:"write"`
	Execute bool `gorm:"not_null;default:false" json:"execute"`

	User  []*User `gorm:"many2many:user_permissions;" json:"users"`
	Teams []*Team `gorm:"many2many:team_permissions; json:"teams""`
}

// func CheckPermissions()
