package db

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/go-sql-driver/mysql"
	"github.com/cenkalti/backoff"
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

func (o *Options) check() error {
	conn, err := sql.Open("mysql", connStr(*o, false))
	if err != nil {
		return err
	}
	defer conn.Close()

	if err := conn.Ping(); err != nil {
		return fmt.Errorf("mysql: could not establish a connection")
	}

	if _, err := conn.Exec("USE " + o.Database); err != nil {
		if merr, ok := err.(*mysql.MySQLError); ok && merr.Number == 1049 {
			if _, err := conn.Exec("CREATE DATABASE IF NOT EXISTS " + o.Database); err != nil {
				return fmt.Errorf("mysql: could not create database: %s", err.Error())
			}
		}
	}

	return nil
}

// Connect initializes database connection.
func Connect(opts Options) error {
	// connstr := opts.User + ":" + opts.Password + "@tcp(" + opts.Hostname + ":" + opts.Port + ")/" + opts.Database + "?charset=" + opts.Charset + "&parseTime=true&loc=Local"
	var err error
	ticker := backoff.NewTicker(backoff.NewConstantBackOff(10*time.Second))

	for range ticker.C {
		if err = opts.check(); err != nil {
			fmt.Printf("database error: %s, retrying in 10s...\n", err.Error())
			continue
		}

		ticker.Stop()
		break
	}

	if err != nil {
		return err
	}

	conn, err := gorm.Open("mysql", connStr(opts, true))
	if err != nil {
		return err
	}
	DB = conn

	conn.AutoMigrate(
		&User{},
		&Team{},
		&Permission{},
		&Integration{},
		&Repository{},
		&Worker{},
		&Build{},
		&Job{},
	)

	return nil
}

func connStr(opts Options, useDb bool) string {
	var cred string
	if opts.User != "" {
		cred = opts.User
		if opts.Password != "" {
			cred = cred + ":" + opts.Password
		}
		cred = cred + "@"
	}

	if useDb {
		return fmt.Sprintf("%stcp([%s]:%s)/%s?charset=%s&parseTime=true&loc=Local", cred, opts.Hostname, opts.Port, opts.Database, opts.Charset)
	}

	return fmt.Sprintf("%stcp([%s]:%s)/", cred, opts.Hostname, opts.Port)
}
