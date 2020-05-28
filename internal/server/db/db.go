package db

import (
	"database/sql"
	"fmt"
	"strconv"

	"github.com/google/wire"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql" // mysql driver.
	"github.com/jkuri/abstruse/internal/server/db/model"
	"github.com/spf13/viper"
	"go.uber.org/zap"
)

// Options config for database.
type Options struct {
	Client   string
	Hostname string
	Port     int
	User     string
	Password string
	Database string
	Charset  string
}

// NewOptions returns new options instance.
func NewOptions(v *viper.Viper, logger *zap.Logger) (*Options, error) {
	opts := &Options{}
	if err := v.UnmarshalKey("db", opts); err != nil {
		return nil, err
	}
	return opts, nil
}

// NewDatabase returns new *gorm.DB instance.
func NewDatabase(opts *Options) (*gorm.DB, error) {
	if err := opts.check(); err != nil {
		return nil, err
	}
	conn, err := gorm.Open(opts.Client, connStr(opts, true))
	if err != nil {
		return nil, err
	}
	conn.AutoMigrate(
		model.User{},
		model.Integration{},
		model.Repository{},
	)

	return conn, err
}

func (opts *Options) check() error {
	conn, err := sql.Open(opts.Client, connStr(opts, false))
	if err != nil {
		return err
	}
	defer conn.Close()

	if err := conn.Ping(); err != nil {
		return fmt.Errorf("mysql: could not establish a connection")
	}

	if _, err := conn.Exec("USE " + opts.Database); err != nil {
		if _, err := conn.Exec(fmt.Sprintf("%s %s", "CREATE DATABASE IF NOT EXISTS", opts.Database)); err != nil {
			return fmt.Errorf("mysql: could not create database: %s", err.Error())
		}
	}

	return nil
}

func connStr(opts *Options, useDb bool) string {
	var cred string
	if opts.User != "" {
		cred = opts.User
		if opts.Password != "" {
			cred = cred + ":" + opts.Password
		}
		cred = cred + "@"
	}
	port := strconv.Itoa(opts.Port)

	if useDb {
		return fmt.Sprintf("%stcp([%s]:%s)/%s?charset=%s&parseTime=true&loc=Local", cred, opts.Hostname, port, opts.Database, opts.Charset)
	}

	return fmt.Sprintf("%stcp([%s]:%s)/", cred, opts.Hostname, port)
}

// ProviderSet export.
var ProviderSet = wire.NewSet(NewDatabase, NewOptions)
