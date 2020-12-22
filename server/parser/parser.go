package parser

import (
	"fmt"
	"strings"

	yaml "gopkg.in/yaml.v2"
)

// Job stage constants
const (
	JobStageTest   = "test"
	JobStageDeploy = "deploy"
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

// JobConfig represents generated job configuration.
type JobConfig struct {
	Image    string   `json:"image"`
	Env      []string `json:"env"`
	Stage    string   `json:"stage"`
	Title    string   `json:"title"`
	Commands []string `json:"commands"`
	Cache    []string `json:"cache"`
}

// ConfigParser defines repository configuration parser.
type ConfigParser struct {
	Raw    string
	Branch string
	Parsed RepoConfig
	Env    []string
}

// NewConfigParser returns new config parser instance.
func NewConfigParser(raw, branch string, env []string) ConfigParser {
	return ConfigParser{
		Raw:    raw,
		Branch: branch,
		Env:    env,
	}
}

// Parse parses raw config.
func (c *ConfigParser) Parse() ([]JobConfig, error) {
	var jobs []JobConfig

	if c.Raw == "" {
		return jobs, fmt.Errorf("cannot parse empty config")
	}

	if err := yaml.Unmarshal([]byte(c.Raw), &c.Parsed); err != nil {
		return jobs, err
	}

	if len(c.Parsed.Script) == 0 {
		return jobs, fmt.Errorf("script commands not specified")
	}

	if len(c.Parsed.Matrix) > 0 {
		for _, item := range c.Parsed.Matrix {
			job := JobConfig{}

			// set image
			if item.Image != "" {
				job.Image = item.Image
			} else {
				job.Image = c.Parsed.Image
			}

			if job.Image == "" {
				return jobs, fmt.Errorf("image not specified")
			}

			// set environment variables
			job.Env = append(job.Env, c.Env...)
			if item.Env != "" {
				job.Env = append(job.Env, item.Env)
			}

			// set stage
			job.Stage = JobStageTest

			// set title
			if item.Env != "" {
				job.Title = item.Env
			} else {
				job.Title = strings.Join(c.Parsed.Script, " ")
			}
			job.Commands = c.generateCommands()

			jobs = append(jobs, job)
		}
	} else {
		job := JobConfig{
			Image:    c.Parsed.Image,
			Env:      c.Env,
			Stage:    JobStageTest,
			Title:    strings.Join(c.Parsed.Script, " "),
			Commands: c.generateCommands(),
		}
		if job.Image == "" {
			return jobs, fmt.Errorf("image not specified")
		}

		jobs = append(jobs, job)
	}

	if len(c.Parsed.Deploy) > 0 {
		job := JobConfig{
			Image:    c.Parsed.Image,
			Env:      c.Env,
			Stage:    JobStageDeploy,
			Title:    strings.Join(c.Parsed.Deploy, " "),
			Commands: c.generateDeployCommands(),
		}
		if job.Image == "" {
			return jobs, fmt.Errorf("image not specified")
		}

		jobs = append(jobs, job)
	}

	return jobs, nil
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

func (c *ConfigParser) generateDeployCommands() []string {
	var commands []string
	commands = appendCommands(commands, c.Parsed.BeforeDeploy)
	commands = appendCommands(commands, c.Parsed.Deploy)
	commands = appendCommands(commands, c.Parsed.AfterDeploy)
	return commands
}

func appendCommands(commands []string, cmds []string) []string {
	for _, cmd := range cmds {
		commands = append(commands, cmd)
	}

	return commands
}
