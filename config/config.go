package config

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
)

// Configuration is global config variable that holds data from config.json.
var Configuration Config

// Config holds data for configuration JSON file.
type Config struct {
	Database Database `json:"database"`
	Security Security `json:"security"`
}

// Database holds data for db configuration
type Database struct {
	Client   string `json:"client"`
	Host     string `json:"host"`
	Port     string `json:"port"`
	User     string `json:"user"`
	Password string `json:"password"`
	Name     string `json:"name"`
	Charset  string `json:"charset"`
}

// Security defines data for security such as jwt tokens.
type Security struct {
	Secret    string `json:"secret"`
	JWTSecret string `json:"jwt_secret"`
	Cert      string `json:"cert"`
	CertKey   string `json:"cert_key"`
}

// ReadAndParseConfig reads and parses configuration from JSON file
func ReadAndParseConfig(configPath string) Config {
	file, err := ioutil.ReadFile(configPath)
	if err != nil {
		fmt.Printf("Error reading configuration file: %v\n", err)
		os.Exit(1)
	}
	var config Config
	err = json.Unmarshal(file, &config)
	if err != nil {
		fmt.Printf("Error parsing configuration file: %v\n", err)
		os.Exit(1)
	}
	Configuration = config

	return config
}

// WriteDefaultConfig writes initial configuration to JSON file.
func WriteDefaultConfig(configPath string) error {
	config := Config{
		Database: Database{
			Client:   "mysql",
			Host:     "localhost",
			Port:     "3306",
			User:     "root",
			Password: "xx2n5",
			Name:     "abstruse_go",
			Charset:  "utf8",
		},
		Security: Security{
			Secret:    "defaultWebhooksSecret",
			JWTSecret: "defaultSecret",
			Cert:      "",
			CertKey:   "",
		},
	}

	configJSON, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return err
	}

	return ioutil.WriteFile(configPath, configJSON, 0644)
}
