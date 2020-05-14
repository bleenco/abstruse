package db

import (
	"database/sql"
	"fmt"
	"strconv"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql" // MySQL driver
)

// DB is exported main database connection.
var DB *gorm.DB

// Config structure for database credentials and options.
type Config struct {
	Client   string
	Hostname string
	Port     int
	User     string
	Password string
	Database string
	Charset  string
}

// Connect initializes database connection.
func Connect(c Config) error {
	var err error
	if err = c.check(); err != nil {
		return err
	}

	if err != nil {
		return err
	}

	conn, err := gorm.Open(c.Client, connStr(c, true))
	if err != nil {
		return err
	}
	DB = conn

	conn.AutoMigrate(
		&User{},
	)

	return nil
}

func (c Config) check() error {
	conn, err := sql.Open(c.Client, connStr(c, false))
	if err != nil {
		return err
	}
	defer conn.Close()

	if err := conn.Ping(); err != nil {
		return fmt.Errorf("mysql: could not establish a connection")
	}

	if _, err := conn.Exec("USE " + c.Database); err != nil {
		if _, err := conn.Exec(fmt.Sprintf("%s %s", "CREATE DATABASE IF NOT EXISTS", c.Database)); err != nil {
			return fmt.Errorf("mysql: could not create database: %s", err.Error())
		}
	}

	return nil
}

func connStr(c Config, useDb bool) string {
	var cred string
	if c.User != "" {
		cred = c.User
		if c.Password != "" {
			cred = cred + ":" + c.Password
		}
		cred = cred + "@"
	}
	port := strconv.Itoa(c.Port)

	if useDb {
		return fmt.Sprintf("%stcp([%s]:%s)/%s?charset=%s&parseTime=true&loc=Local", cred, c.Hostname, port, c.Database, c.Charset)
	}

	return fmt.Sprintf("%stcp([%s]:%s)/", cred, c.Hostname, port)
}
