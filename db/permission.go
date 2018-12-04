package db

import "database/sql"

// Permission defines `permissions` table in db.
type Permission struct {
	BaseModel

	Admin  bool `gorm:"not_null;default:false"`
	System bool `gorm:"not_null;default:false"`
	Read   bool `gorm:"not_null;default:false"`
	Write  bool `gorm:"not_null;default:false"`

	Repository   Repository
	RepositoryID sql.NullInt64

	User  []User `gorm:"many2many:user_permissions;"`
	Teams []Team `gorm:"many2many:team_permissions;"`
}
