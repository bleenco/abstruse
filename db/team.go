package db

// Team defines `teams` table in db.
type Team struct {
	BaseModel

	Title       string `gorm:"not null" json:"title"`
	Description string `json:"description"`
	Color       string `gorm:"not null;default:'#FFFFFF'" json:"color"`
	IsDeletable bool   `gorm:"not null;default:true" json:"is_deletable"`

	User []User `gorm:"many2many:team_users;"`
}
