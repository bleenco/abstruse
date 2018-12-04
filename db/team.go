package db

import "errors"

// Team defines `teams` table in db.
type Team struct {
	BaseModel

	Title       string `gorm:"not null;unique_index" json:"title"`
	Description string `json:"description"`
	Color       string `gorm:"not null;default:'rgba(22,101,216,1)'" json:"color"`
	IsDeletable bool   `gorm:"not null;default:false" json:"is_deletable"`

	User       []*User       `gorm:"many2many:team_users;"`
	Permission []*Permission `gorm:"many2many:team_permissions;"`
}

// Find method
func (t *Team) Find(teamID int) error {
	return DB.First(t, teamID).Error
}

// AddUser to team.
func (t *Team) AddUser(userID int) error {
	var user User
	if _, err := user.Find(userID); err == nil {
		return DB.Model(t).Association("User").Append(user).Error
	}

	return errors.New("user already in specified team")
}
