package worker

import (
	"encoding/json"
	"io/ioutil"

	"github.com/bleenco/abstruse/fs"
)

// Config holds data for configuration JSON file.
type Config struct {
	ServerAddress string `json:"server_address"`
	ServerSecret  string `json:"server_secret"`
	Cert          string `json:"cert"`
	Key           string `json:"key"`
}

func readAndParseConfig(configPath string) (*Config, error) {
	var config *Config

	if !fs.Exists(configPath) {
		if err := writeDefaultConfig(configPath); err != nil {
			return config, err
		}
	}

	file, err := ioutil.ReadFile(configPath)
	if err != nil {
		return config, err
	}
	err = json.Unmarshal(file, &config)
	if err != nil {
		return config, nil
	}

	return config, nil
}

// writeDefaultConfig writes initial configuration to JSON file.
func writeDefaultConfig(configPath string) error {
	config := Config{
		ServerAddress: "0.0.0.0:3330",
		ServerSecret:  "defaultSecret",
		Cert:          "./cert.pem",
		Key:           "./key.pem",
	}

	configJSON, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return err
	}

	return ioutil.WriteFile(configPath, configJSON, 0644)
}
