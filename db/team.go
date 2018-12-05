package db

import (
	"errors"
	"time"
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

// Update updates team general properties.
func (t *Team) Update(userID int) error {
	var team Team
	if err := DB.Preload("User.Team.Permission").Find(&team).Error; err != nil {
		return err
	}

	checkPerm := func(team Team) bool {
		for _, user := range team.User {
			if user.ID == uint(userID) {
				for _, permission := range user.Permission {
					if permission.Module == "teams_write" {
						return true
					}
				}
				for _, t := range user.Team {
					for _, permission := range t.Permission {
						if permission.Module == "teams_write" {
							return true
						}
					}
				}
			}
		}
		return false
	}

	if !checkPerm(team) {
		return errors.New("permission denied")
	}

	return DB.Model(t).Updates(map[string]interface{}{"updated_at": time.Now(), "color": t.Color, "description": t.Description, "title": t.Title}).Error
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

	if checkPerm(teams) {
		return teams, nil
	} else {
		return nil, errors.New("permission denied")
	}
}
