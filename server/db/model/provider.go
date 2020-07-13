package model

// Provider represents `providers` db table.
type Provider struct {
	ID          uint   `gorm:"primary_key;auto_increment;not null" json:"id"`
	Name        string `gorm:"not null" json:"name"`
	URL         string `gorm:"not null" json:"url"`
	AccessToken string `gorm:"not null" json:"accessToken"`
	Secret      string `gorm:"not null" json:"secret"`
	UserID      uint   `gorm:"not null" json:"userID"`
	User        User   `json:"user"`
	TimestampModel
}
