package db

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/bleenco/abstruse/pkg/lib"
	"github.com/bleenco/abstruse/server/config"
	"github.com/bleenco/abstruse/server/db/model"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mssql"    // mssql driver
	_ "github.com/jinzhu/gorm/dialects/mysql"    // mysql driver
	_ "github.com/jinzhu/gorm/dialects/postgres" // postres driver
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
func Connect(cfg *config.Db, logger *zap.Logger) {
	log := logger.With(zap.String("type", "db")).Sugar()

	if err := check(cfg); err != nil {
		log.Errorf("database connection issue: %v", err)
	} else {
		conn, err := gorm.Open(cfg.Driver, connString(cfg, true))
		if err != nil {
			log.Errorf("database connection issue: %v", err)
			if strings.Contains(err.Error(), "could not establish a connection") || strings.Contains(err.Error(), "connection refused") {
				go wait(cfg, logger)
			}
		} else {
			conn.AutoMigrate(
				model.User{},
				model.Token{},
				model.Provider{},
				model.Repository{},
				model.Build{},
				model.Job{},
				model.Image{},
				model.ImageTag{},
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

// CheckConnection checks valid database connection.
func CheckConnection(cfg *config.Db) bool {
	conn, err := sql.Open(cfg.Driver, connString(cfg, false))
	if err != nil {
		return false
	}
	defer conn.Close()
	if err := conn.Ping(); err != nil {
		return false
	}

	return true
}

func connString(cfg *config.Db, useDB bool) string {
	switch strings.ToLower(cfg.Driver) {
	case "mysql", "mariadb":
		if useDB {
			return fmt.Sprintf("%stcp([%s]:%d)/%s?charset=%s&parseTime=true&loc=Local", credentials(cfg), cfg.Host, cfg.Port, cfg.Name, cfg.Charset)
		}
		return fmt.Sprintf("%stcp([%s]:%d)/", credentials(cfg), cfg.Host, cfg.Port)
	case "mssql":
		return fmt.Sprintf("sqlserver://%s%s:%d?database=%s", credentials(cfg), cfg.Host, cfg.Port, cfg.Name)
	case "postgres", "postgresql":
		return fmt.Sprintf("host=%s port=%d user=%s dbname=%s password=%s", cfg.Host, cfg.Port, cfg.User, cfg.Name, cfg.Password)
	case "sqlite", "sqlite3":
		return cfg.Name
	default:
		return ""
	}
}

func check(cfg *config.Db) error {
	switch strings.ToLower(cfg.Driver) {
	case "mysql", "mariadb":
		return checkMySQL(cfg)
	default:
		return nil
	}
}

func checkMySQL(cfg *config.Db) error {
	conn, err := sql.Open(cfg.Driver, connString(cfg, false))
	if err != nil {
		return err
	}
	defer conn.Close()

	if err := conn.Ping(); err != nil {
		return fmt.Errorf("mysql: could not establish a connection")
	}

	if _, err := conn.Exec(fmt.Sprintf("USE %s", cfg.Name)); err != nil {
		if _, err := conn.Exec(fmt.Sprintf("%s %s", "CREATE DATABASE IF NOT EXISTS", cfg.Name)); err != nil {
			return fmt.Errorf("mysql: could not create database: %s", err.Error())
		}
	}

	return nil
}

func credentials(cfg *config.Db) string {
	return fmt.Sprintf("%s:%s@", cfg.User, cfg.Password)
}

// simple solution when running this from docker compose.
func wait(cfg *config.Db, logger *zap.Logger) {
	if err := lib.WaitTCP(time.Minute*1, cfg.Host, cfg.Port); err == nil {
		if db == nil {
			logger.Sugar().Debugf("database online, trying to reconnect")
			Connect(cfg, logger)
		}
	}
}
