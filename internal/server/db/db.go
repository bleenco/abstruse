package db

import (
	"database/sql"
	"fmt"
	"strconv"

	"github.com/google/wire"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql" // mysql driver.
	"github.com/jkuri/abstruse/internal/server/db/model"
	"github.com/jkuri/abstruse/internal/server/options"
)

// NewDatabase returns new *gorm.DB instance.
func NewDatabase(opts *options.Options) (*gorm.DB, error) {
	if err := check(opts); err != nil {
		return nil, err
	}
	conn, err := gorm.Open(opts.DB.Client, connStr(opts, true))
	if err != nil {
		return nil, err
	}
	conn.AutoMigrate(
		model.User{},
		model.Repository{},
		model.Provider{},
		model.Build{},
		model.Job{},
	)

	return conn, err
}

func check(opts *options.Options) error {
	conn, err := sql.Open(opts.DB.Client, connStr(opts, false))
	if err != nil {
		return err
	}
	defer conn.Close()

	if err := conn.Ping(); err != nil {
		return fmt.Errorf("mysql: could not establish a connection")
	}

	if _, err := conn.Exec("USE " + opts.DB.Database); err != nil {
		if _, err := conn.Exec(fmt.Sprintf("%s %s", "CREATE DATABASE IF NOT EXISTS", opts.DB.Database)); err != nil {
			return fmt.Errorf("mysql: could not create database: %s", err.Error())
		}
	}

	return nil
}

func connStr(opts *options.Options, useDb bool) string {
	var cred string
	if opts.DB.User != "" {
		cred = opts.DB.User
		if opts.DB.Password != "" {
			cred = cred + ":" + opts.DB.Password
		}
		cred = cred + "@"
	}
	port := strconv.Itoa(opts.DB.Port)

	if useDb {
		return fmt.Sprintf("%stcp([%s]:%s)/%s?charset=%s&parseTime=true&loc=Local", cred, opts.DB.Hostname, port, opts.DB.Database, opts.DB.Charset)
	}

	return fmt.Sprintf("%stcp([%s]:%s)/", cred, opts.DB.Hostname, port)
}

// ProviderSet export.
var ProviderSet = wire.NewSet(NewDatabase)
