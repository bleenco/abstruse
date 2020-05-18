package model

// User defines `users` database table.
type User struct {
	ID       uint   `gorm:"PRIMARY_KEY;AUTO_INCREMENT;NOT NULL" json:"id"`
	Email    string `gorm:"not null;varchar(255);unique_index" json:"email"`
	Password string `gorm:"not null;varchar(255);column:password" json:"-"`
	Fullname string `gorm:"not null;varchar(255)" json:"fullname"`
	Avatar   string `gorm:"not null;varchar(255);default:'/assets/images/avatars/avatar_1.svg'" json:"avatar"`
	TimestampModel
}
