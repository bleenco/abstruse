package db

import (
	"database/sql"
	"fmt"
	"os"
	"strconv"

	"github.com/google/wire"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql" // mysql driver.
	"github.com/jkuri/abstruse/pkg/auth"
	"github.com/jkuri/abstruse/pkg/server/db/model"
	"github.com/jkuri/abstruse/pkg/server/options"
	"github.com/jkuri/abstruse/pkg/util"
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
	if err := createAdmin(conn); err != nil {
		return nil, err
	}

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

	if _, err := conn.Exec("USE " + opts.DB.Name); err != nil {
		if _, err := conn.Exec(fmt.Sprintf("%s %s", "CREATE DATABASE IF NOT EXISTS", opts.DB.Name)); err != nil {
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
		return fmt.Sprintf("%stcp([%s]:%s)/%s?charset=%s&parseTime=true&loc=Local", cred, opts.DB.Hostname, port, opts.DB.Name, opts.DB.Charset)
	}

	return fmt.Sprintf("%stcp([%s]:%s)/", cred, opts.DB.Hostname, port)
}

func createAdmin(db *gorm.DB) error {
	email, passwd, name := os.Getenv("ABSTRUSE_ADMIN_EMAIL"), os.Getenv("ABSTRUSE_ADMIN_PASSWORD"), os.Getenv("ABSTRUSE_ADMIN_NAME")
	if email != "" && passwd != "" {
		pass, err := auth.HashPassword(passwd)
		if err != nil {
			return err
		}
		avatar := fmt.Sprintf("/assets/images/avatars/avatar_%d.svg", util.RandomInt(1, 30))
		user := &model.User{Email: email, Password: pass, Fullname: name, Avatar: avatar, Admin: true}
		return db.FirstOrCreate(user).Error

	}
	return nil
}

// ProviderSet export.
var ProviderSet = wire.NewSet(NewDatabase)
