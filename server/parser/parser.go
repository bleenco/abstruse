package parser

import (
	"fmt"
	"regexp"
	"strings"

	api "github.com/bleenco/abstruse/pb"
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
	Archive       []string       `yaml:"archive"`
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
	Image    string           `json:"image"`
	Env      []string         `json:"env"`
	Mount    string           `json:"mount"`
	Stage    string           `json:"stage"`
	Title    string           `json:"title"`
	Commands *api.CommandList `json:"commands"`
	Cache    []string         `json:"cache"`
	Archive  []string         `json:"archive"`
}

// ConfigParser defines repository configuration parser.
type ConfigParser struct {
	Raw     string
	Branch  string
	Parsed  RepoConfig
	Env     []string
	Mount   []string
	Archive []string
}

// NewConfigParser returns new config parser instance.
func NewConfigParser(raw, branch string, env []string, mount []string) ConfigParser {
	return ConfigParser{
		Raw:    raw,
		Branch: branch,
		Env:    env,
		Mount:  mount,
	}
}

// Parse parses raw config.
func (c *ConfigParser) Parse() ([]*JobConfig, error) {
	var jobs []*JobConfig

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
			job := &JobConfig{}
			job.Archive = c.Parsed.Archive

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
			job.Cache = c.Parsed.Cache
			jobs = append(jobs, job)
		}
	} else {
		job := &JobConfig{
			Image:    c.Parsed.Image,
			Env:      c.Env,
			Mount:    strings.Join(c.Mount, ","),
			Stage:    JobStageTest,
			Title:    strings.Join(c.Parsed.Script, " "),
			Commands: c.generateCommands(),
			Cache:    c.Parsed.Cache,
			Archive:  c.Parsed.Archive,
		}
		if job.Image == "" {
			return jobs, fmt.Errorf("image not specified")
		}

		jobs = append(jobs, job)
	}

	if len(c.Parsed.Deploy) > 0 {
		job := &JobConfig{
			Image:    c.Parsed.Image,
			Env:      c.Env,
			Mount:    strings.Join(c.Mount, ","),
			Stage:    JobStageDeploy,
			Title:    strings.Join(c.Parsed.Deploy, " "),
			Commands: c.generateDeployCommands(),
			Cache:    c.Parsed.Cache,
			Archive:  c.Parsed.Archive,
		}
		if job.Image == "" {
			return jobs, fmt.Errorf("image not specified")
		}

		jobs = append(jobs, job)
	}

	return jobs, nil
}

// ShouldBuild checks if build should be triggered considering
// the test and ignore branches configuration.
func (c *ConfigParser) ShouldBuild() bool {
	if len(c.Parsed.Branches.Ignore) == 0 && len(c.Parsed.Branches.Test) == 0 {
		return true
	}

	if len(c.Parsed.Branches.Ignore) > 0 {
		for _, ignore := range c.Parsed.Branches.Ignore {
			r, err := regexp.Compile(ignore)
			if err != nil {
				continue
			}
			if r.MatchString(c.Branch) {
				return false
			}
		}
	}

	if len(c.Parsed.Branches.Test) > 0 {
		for _, test := range c.Parsed.Branches.Test {
			r, err := regexp.Compile(test)
			if err != nil {
				continue
			}
			if r.MatchString(c.Branch) {
				return true
			}
		}
	}

	return true
}

func (c *ConfigParser) generateCommands() *api.CommandList {
	var commands api.CommandList

	commands.Commands = append(commands.Commands, c.appendCommands(c.Parsed.BeforeInstall, api.Command_BeforeInstall)...)
	commands.Commands = append(commands.Commands, c.appendCommands(c.Parsed.Install, api.Command_Install)...)
	commands.Commands = append(commands.Commands, c.appendCommands(c.Parsed.BeforeScript, api.Command_BeforeScript)...)
	commands.Commands = append(commands.Commands, c.appendCommands(c.Parsed.Script, api.Command_Script)...)
	commands.Commands = append(commands.Commands, c.appendCommands(c.Parsed.AfterSuccess, api.Command_AfterSuccess)...)
	commands.Commands = append(commands.Commands, c.appendCommands(c.Parsed.AfterFailure, api.Command_AfterFailure)...)
	commands.Commands = append(commands.Commands, c.appendCommands(c.Parsed.AfterScript, api.Command_AfterScript)...)

	return &commands
}

func (c *ConfigParser) generateDeployCommands() *api.CommandList {
	var commands api.CommandList

	commands.Commands = append(commands.Commands, c.appendCommands(c.Parsed.BeforeDeploy, api.Command_BeforeDeploy)...)
	commands.Commands = append(commands.Commands, c.appendCommands(c.Parsed.Deploy, api.Command_Deploy)...)
	commands.Commands = append(commands.Commands, c.appendCommands(c.Parsed.AfterDeploy, api.Command_AfterDeploy)...)

	return &commands
}

func (c *ConfigParser) appendCommands(cmds []string, ctype api.Command_CommandType) []*api.Command {
	var commands []*api.Command
	for _, cmd := range cmds {
		c := api.Command{Type: ctype, Command: cmd}
		commands = append(commands, &c)
	}
	return commands
}
