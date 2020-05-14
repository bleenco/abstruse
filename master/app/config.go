package app

import (
	"encoding/json"
	"fmt"
	"io/ioutil"

	"github.com/jkuri/abstruse/master/db"
	"github.com/jkuri/abstruse/master/etcdserver"
	"github.com/jkuri/abstruse/master/httpserver"
	"github.com/jkuri/abstruse/master/rpc"
)

// Config defines configuration for master application.
type Config struct {
	HTTP      httpserver.Config `json:"http"`
	Etcd      etcdserver.Config `json:"etcd"`
	GRPC      rpc.Config        `json:"grpc"`
	Database  db.Config         `json:"database"`
	LogLevel  string            `json:"log_level"`
	JWTSecret string            `json:"jwt_secret"`
}

// ReadAndParseConfig reads and parses configuration from JSON file.
func ReadAndParseConfig(configPath string) (Config, error) {
	var config Config
	file, err := ioutil.ReadFile(configPath)
	if err != nil {
		return config, fmt.Errorf("Error reading configuration file: %v", err)
	}
	err = json.Unmarshal(file, &config)
	if err != nil {
		return config, fmt.Errorf("Error parsing configuration file: %v", err)
	}

	return config, nil
}
