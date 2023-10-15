package store

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/bleenco/abstruse/server/config"
	"github.com/bleenco/abstruse/server/core"
	"github.com/jpillora/backoff"
	"go.uber.org/zap"
	"gorm.io/driver/clickhouse"
	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/driver/sqlserver"
	"gorm.io/gorm"
)

var db *gorm.DB
var b = &backoff.Backoff{
	Min:    5 * time.Second,
	Max:    10 * time.Second,
	Jitter: false,
}

// New returns new database instance.
func New(config *config.Config, logger *zap.Logger) (*gorm.DB, error) {
	connect(config.DB, logger)
	return instance()
}

// instance returns db connection.
func instance() (*gorm.DB, error) {
	if db == nil {
		return nil, fmt.Errorf("database connection not initialized")
	}
	return db, nil
}

// connect connects to database.
func connect(cfg *config.DB, logger *zap.Logger) {
	log := logger.With(zap.String("type", "db")).Sugar()

	if err := check(cfg); err != nil {
		log.Errorf("database connection issue: %v", err)
		if strings.Contains(err.Error(), "could not establish a connection") || strings.Contains(err.Error(), "connection refused") {
			go reconnectLoop(cfg, logger)
		}
	} else {
		dsn := dsn(cfg, true)
		var conn *gorm.DB
		var err error

		switch cfg.Driver {
		case "mysql":
			conn, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
		case "postgres":
			conn, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
		case "sqlite":
			conn, err = gorm.Open(sqlite.Open(cfg.Name), &gorm.Config{})
		case "clickhouse":
			conn, err = gorm.Open(clickhouse.Open(dsn), &gorm.Config{})
		case "sqlserver":
			conn, err = gorm.Open(sqlserver.Open(dsn), &gorm.Config{})
		}

		if err != nil {
			log.Errorf("database connection issue: %v", err)
		} else {
			conn.AutoMigrate(
				core.User{},
				core.Team{},
				core.Permission{},
				core.Repository{},
				core.EnvVariable{},
				core.Mount{},
				core.Provider{},
				core.Job{},
				core.Build{},
			)
			db = conn
			log.Debugf("succesfully connected to database")
		}
	}
}

// Close closes database connection.
func Close() error {
	sql, err := db.DB()
	if err != nil {
		return err
	}

	return sql.Close()
}

// CheckConnection checks valid database connection.
func CheckConnection(cfg *config.DB) bool {
	conn, err := sql.Open(cfg.Driver, dsn(cfg, false))
	if err != nil {
		return false
	}
	defer conn.Close()
	if err := conn.Ping(); err != nil {
		return false
	}

	return true
}

func dsn(cfg *config.DB, useDB bool) string {
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
	case "clickhouse":
		return fmt.Sprintf("tcp://%s:%d?database=%s&username=%s&password=%s", cfg.Host, cfg.Port, cfg.Name, cfg.User, cfg.Password)
	default:
		return ""
	}
}

func check(cfg *config.DB) error {
	switch strings.ToLower(cfg.Driver) {
	case "mysql", "mariadb":
		return checkMySQL(cfg)
	default:
		return nil
	}
}

func checkMySQL(cfg *config.DB) error {
	conn, err := sql.Open(cfg.Driver, dsn(cfg, false))
	if err != nil {
		return err
	}
	defer conn.Close()

	if err := conn.Ping(); err != nil {
		return fmt.Errorf("mysql: could not establish a connection: %v", err.Error())
	}

	if _, err := conn.Exec(fmt.Sprintf("USE %s", cfg.Name)); err != nil {
		if _, err := conn.Exec(fmt.Sprintf("%s %s", "CREATE DATABASE IF NOT EXISTS", cfg.Name)); err != nil {
			return fmt.Errorf("mysql: could not create database: %s", err.Error())
		}
	}

	return nil
}

func credentials(cfg *config.DB) string {
	return fmt.Sprintf("%s:%s@", cfg.User, cfg.Password)
}

func reconnectLoop(cfg *config.DB, logger *zap.Logger) {
	if b.Attempt() == 0 {
		for {
			dur := b.Duration()
			logger.Sugar().Debugf("reconnecting to database in %v...", dur)
			time.Sleep(dur)
			connect(cfg, logger)
			if db != nil {
				b.Reset()
				break
			}
		}
	}
}
