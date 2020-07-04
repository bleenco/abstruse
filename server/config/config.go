package config

import "github.com/ractol/ractol/pkg/logger"

// Config holds configuration data.
type Config struct {
	Auth Auth          `json:"auth"`
	Db   Db            `json:"db"`
	Etcd Etcd          `json:"etcd"`
	HTTP HTTP          `json:"http"`
	Log  logger.Config `json:"log"`
	TLS  TLS           `json:"tls"`
}

// Auth authentication config.
type Auth struct {
	Secret string `json:"secret"`
}

// Db database config.
type Db struct {
	Charset  string `json:"charset"`
	Client   string `json:"client"`
	Host     string `json:"host"`
	Name     string `json:"name"`
	Password string `json:"password"`
	Port     int    `json:"port"`
	User     string `json:"user"`
}

// Etcd config.
type Etcd struct {
	Addr     string `json:"addr"`
	Password string `json:"password"`
	Username string `json:"username"`
}

// HTTP server config.
type HTTP struct {
	Addr string `json:"addr"`
	TLS  bool   `json:"tls"`
}

// TLS config.
type TLS struct {
	Cert string `json:"cert"`
	Key  string `json:"key"`
}
