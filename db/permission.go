package db

import (
	"database/sql"
)

// Permission defines `permissions` table in db.
type Permission struct {
	BaseModel

	Module string `json:"module"`
	Title  string `json:"title"`

	Read    bool `gorm:"not_null;default:false" json:"read"`
	Write   bool `gorm:"not_null;default:false" json:"write"`
	Execute bool `gorm:"not_null;default:false" json:"execute"`

	Repository   Repository    `json:"repository,omitempty"`
	RepositoryID sql.NullInt64 `json:"repository_id,omitempty"`

	User  []*User `gorm:"many2many:user_permissions" json:"users"`
	Teams []*Team `gorm:"many2many:team_permissions" json:"teams"`
}

// PredefinedPermission defines struct for system applied permissions.
type PredefinedPermission struct {
	Module  string `json:"module"`
	Title   string `json:"title"`
	Enabled bool   `json:"enabled"`
}

// FindPredefinedPermissions finds system applied permission policies.
func FindPredefinedPermissions(teamID int) ([]PredefinedPermission, error) {
	var perms []PredefinedPermission
	var permissions []Permission
	var team Team

	err := DB.Where("repository_id IS NULL").Find(&permissions).Error
	if err != nil {
		return perms, err
	}

	for _, p := range permissions {
		perms = append(perms, PredefinedPermission{Module: p.Module, Title: p.Title, Enabled: false})
	}

	err = DB.Preload("Permission").Where("id = ?", teamID).Find(&team).Error
	if err != nil {
		return perms, err
	}

	for i, p := range perms {
		for _, pp := range team.Permission {
			if p.Module == pp.Module {
				perms[i].Enabled = true
			}
		}
	}

	return perms, nil
}
