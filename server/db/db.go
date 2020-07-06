package db

import (
	"database/sql"
	"fmt"
	"strings"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mssql"    // mssql driver
	_ "github.com/jinzhu/gorm/dialects/mysql"    // mysql driver
	_ "github.com/jinzhu/gorm/dialects/postgres" // postres driver
	"github.com/ractol/ractol/server/config"
	"github.com/ractol/ractol/server/db/model"
	"go.uber.org/zap"
)

var db *gorm.DB

// Instance returns db connection.
func Instance() (*gorm.DB, error) {
	if db == nil {
		return nil, fmt.Errorf("database connection not initialized")
	}
	return db, nil
}

// Connect connects to database.
func Connect(cfg config.Config, logger *zap.Logger) {
	log := logger.With(zap.String("type", "db")).Sugar()

	if err := check(cfg); err != nil {
		log.Errorf("database connection issue: %v", err)
	} else {
		conn, err := gorm.Open(cfg.Db.Client, connString(cfg, true))
		if err != nil {
			log.Errorf("database connection issue: %v", err)
		} else {
			conn.AutoMigrate(
				model.User{},
				model.Token{},
			)
			db = conn
			log.Debugf("succesfully connected to database")
		}
	}
}

// Close closes database connection.
func Close() error {
	return db.Close()
}

func connString(cfg config.Config, useDB bool) string {
	switch strings.ToLower(cfg.Db.Client) {
	case "mysql", "mariadb":
		if useDB {
			return fmt.Sprintf("%stcp([%s]:%d)/%s?charset=%s&parseTime=true&loc=Local", credentials(cfg), cfg.Db.Host, cfg.Db.Port, cfg.Db.Name, cfg.Db.Charset)
		}
		return fmt.Sprintf("%stcp([%s]:%d)/", credentials(cfg), cfg.Db.Host, cfg.Db.Port)
	case "mssql":
		return fmt.Sprintf("sqlserver://%s%s:%d?database=%s", credentials(cfg), cfg.Db.Host, cfg.Db.Port, cfg.Db.Name)
	case "postgres", "postgresql":
		return fmt.Sprintf("host=%s port=%d user=%s dbname=%s password=%s", cfg.Db.Host, cfg.Db.Port, cfg.Db.User, cfg.Db.Name, cfg.Db.Password)
	case "sqlite", "sqlite3":
		return cfg.Db.Name
	default:
		return ""
	}
}

func check(cfg config.Config) error {
	switch strings.ToLower(cfg.Db.Client) {
	case "mysql", "mariadb":
		return checkMySQL(cfg)
	default:
		return nil
	}
}

func checkMySQL(cfg config.Config) error {
	conn, err := sql.Open(cfg.Db.Client, connString(cfg, false))
	if err != nil {
		return err
	}
	defer conn.Close()

	if err := conn.Ping(); err != nil {
		return fmt.Errorf("mysql: could not establish a connection")
	}

	if _, err := conn.Exec(fmt.Sprintf("USE %s", cfg.Db.Name)); err != nil {
		if _, err := conn.Exec(fmt.Sprintf("%s %s", "CREATE DATABASE IF NOT EXISTS", cfg.Db.Name)); err != nil {
			return fmt.Errorf("mysql: could not create database: %s", err.Error())
		}
	}

	return nil
}

func credentials(cfg config.Config) string {
	return fmt.Sprintf("%s:%s@", cfg.Db.User, cfg.Db.Password)
}
