package model

// Team defines `teams` database table.
type Team struct {
	ID    uint    `gorm:"primary_key;auto_increment;not null" json:"id"`
	Name  string  `gorm:"not null,unique_index" json:"name"`
	About string  `gorm:"type:text" json:"about"`
	Color string  `gorm:"not null" json:"color"`
	Users []*User `gorm:"many2many:team_users;" json:"users"`
	TimestampModel
}
