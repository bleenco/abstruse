package parser

import (
	"fmt"

	yaml "gopkg.in/yaml.v2"
)

// RepoConfig defines structure for .abstruse.yml configuration files.
type RepoConfig struct {
	Image         string         `yaml:"image"`
	Branches      BranchesConfig `yaml:"branches"`
	Matrix        []MatrixConfig `yaml:"matrix"`
	BeforeInstall []string       `yaml:"before_install"`
	Install       []string       `yaml:"install"`
	BeforeScript  []string       `yaml:"before_script"`
	Script        []string       `yaml:"script"`
	AfterSuccess  []string       `yaml:"after_success"`
	AfterFailure  []string       `yaml:"after_failure"`
	BeforeDeploy  []string       `yaml:"before_deploy"`
	Deploy        []string       `yaml:"deploy"`
	AfterDeploy   []string       `yaml:"after_deploy"`
	AfterScript   []string       `yaml:"after_script"`
	Cache         []string       `yaml:"cache"`
}

// MatrixConfig defines structure for matrix job config in .abstruse.yml file.
type MatrixConfig struct {
	Env   string `yaml:"env"`
	Image string `yaml:"image"`
}

// BranchesConfig defines structure for branches config in .abstruse.yml file.
type BranchesConfig struct {
	Test   []string `yaml:"test"`
	Ignore []string `yaml:"ignore"`
}

// ConfigParser defines repository configuration parser.
type ConfigParser struct {
	Raw      string
	Parsed   RepoConfig
	Env      []string
	Commands []string
}

// Parse parses raw config.
func (c *ConfigParser) Parse() error {
	if c.Raw == "" {
		return fmt.Errorf("cannot parse empty config")
	}

	if err := yaml.Unmarshal([]byte(c.Raw), &c.Parsed); err != nil {
		return err
	}

	c.Env = c.generateEnv()
	c.Commands = c.generateCommands()

	return nil
}

func (c *ConfigParser) generateEnv() []string {
	var env []string

	for _, matrixItem := range c.Parsed.Matrix {
		env = append(env, matrixItem.Env)
	}

	return env
}

func (c *ConfigParser) generateCommands() []string {
	var commands []string
	commands = appendCommands(commands, c.Parsed.BeforeInstall)
	commands = appendCommands(commands, c.Parsed.Install)
	commands = appendCommands(commands, c.Parsed.BeforeScript)
	commands = appendCommands(commands, c.Parsed.Script)
	commands = appendCommands(commands, c.Parsed.AfterSuccess)
	commands = appendCommands(commands, c.Parsed.AfterFailure)
	commands = appendCommands(commands, c.Parsed.AfterScript)
	return commands
}

func appendCommands(commands []string, cmds []string) []string {
	for _, cmd := range cmds {
		commands = append(commands, cmd)
	}

	return commands
}
