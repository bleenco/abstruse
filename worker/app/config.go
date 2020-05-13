package app

import (
	"encoding/json"
	"fmt"
	"io/ioutil"

	"github.com/jkuri/abstruse/worker/rpc"
)

// Config defines configuration for worker app.
type Config struct {
	ServerAddr string     `json:"server_addr"`
	GRPC       rpc.Config `json:"grpc"`
	LogLevel   string     `json:"log_level"`
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
