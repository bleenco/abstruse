package parser

import (
	"errors"

	"github.com/bleenco/abstruse/git"
	yaml "gopkg.in/yaml.v2"
)

const rawData = `
image: ubuntu_latest_node

matrix:
  - env: SCRIPT=lint NODE_VERSION=10
  - env: SCRIPT=test NODE_VERSION=10
  - env: SCRIPT=test:e2e NODE_VERSION=10
  - env: SCRIPT=test:protractor NODE_VERSION=10
  - env: SCRIPT=test:karma:ci NODE_VERSION=10

before_install:
  - nvm install $NODE_VERSION
  - npm config set spin false
  - npm config set progress false

install:
  - npm install

script:
  - if [[ "$SCRIPT" ]]; then npm run-script $SCRIPT; fi

cache:
  - node_modules
`

// RepoConfig defines structure for .abstruse.yml configuration files.
type RepoConfig struct {
	Image            string         `yaml:"image"`
	Branches         BranchesConfig `yaml:"branches"`
	Matrix           []MatrixConfig `yaml:"matrix"`
	BeforeInstall    []string       `yaml:"before_install"`
	Install          []string       `yaml:"install"`
	BeforeScript     []string       `yaml:"before_script"`
	Script           []string       `yaml:"script"`
	AfterSuccessfull []string       `yaml:"after_successful"`
	AfterFailure     []string       `yaml:"after_failure"`
	AfterScript      []string       `yaml:"after_script"`
	Cache            []string       `yaml:"cache"`
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
	Raw string

	CloneURL string
	Branch   string
	Commit   string
	PR       string

	Parsed   RepoConfig
	Env      []string
	Commands []string
}

// FetchRawConfig fetches raw config from repository.
func (c *ConfigParser) FetchRawConfig() error {
	raw, err := git.FetchAbstruseConfig(c.CloneURL, c.Branch, c.Commit, c.PR)
	if err != nil {
		return err
	}
	c.Raw = raw

	return nil
}

// Parse parses raw config.
func (c *ConfigParser) Parse() error {
	if c.Raw == "" {
		return errors.New("cannot parse empty config")
	}

	if err := yaml.Unmarshal([]byte(c.Raw), &c.Parsed); err != nil {
		return err
	}

	c.Commands = c.generateCommands()

	return nil
}

func (c *ConfigParser) generateCommands() []string {
	var commands []string

	commands = append(commands, "git clone -q "+c.CloneURL+" .")
	commands = appendCommands(commands, c.Parsed.BeforeInstall)
	commands = appendCommands(commands, c.Parsed.Install)
	commands = appendCommands(commands, c.Parsed.BeforeScript)
	commands = appendCommands(commands, c.Parsed.Script)
	commands = appendCommands(commands, c.Parsed.AfterSuccessfull)
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
