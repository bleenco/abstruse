package db

import (
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql" // MySQL driver
)

// DB is exported main database connection.
var DB *gorm.DB

// Options structure for database credentials and options.
type Options struct {
	Client   string
	Hostname string
	Port     string
	User     string
	Password string
	Database string
	Charset  string
}

// Connect initializes database connection.
func Connect(opts Options) error {
	connstr := opts.User + ":" + opts.Password + "@tcp(" + opts.Hostname + ":" + opts.Port + ")/" + opts.Database + "?charset=" + opts.Charset + "&parseTime=True&loc=Local"
	conn, err := gorm.Open("mysql", connstr)
	if err != nil {
		return err
	}
	DB = conn

	DB.AutoMigrate(
		&User{},
		&Integration{},
	)

	return nil
}
