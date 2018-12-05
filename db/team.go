package db

import (
	"errors"
	"fmt"
)

// Team defines `teams` table in db.
type Team struct {
	BaseModel

	Title       string `gorm:"not null;unique_index" json:"title"`
	Description string `json:"description"`
	Color       string `gorm:"not null;default:'rgba(22,101,216,1)'" json:"color"`
	IsDeletable bool   `gorm:"not null;default:false" json:"is_deletable"`

	User       []*User       `gorm:"many2many:team_users;" json:"users"`
	Permission []*Permission `gorm:"many2many:team_permissions;" json:"permissions"`
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

// FindTeams method.
func FindTeams(userID int) ([]Team, error) {
	var teams []Team
	if err := DB.Preload("User.Team.Permission").Find(&teams).Error; err != nil {
		return teams, err
	}

	checkPerm := func(teams []Team) bool {
		for _, team := range teams {
			for _, user := range team.User {
				if user.ID == uint(userID) {
					for _, permission := range user.Permission {
						if permission.Module == "teams_read" {
							return true
						}
					}
					for _, t := range user.Team {
						for _, permission := range t.Permission {
							if permission.Module == "teams_read" {
								return true
							}
						}
					}
				}
			}
		}
		return false
	}

	fmt.Println(checkPerm(teams))

	return teams, nil
}
