package core

import "time"

// Worker represents remote worker instance.
type Worker interface {
	// ID returns workers id.
	ID() string

	// Run starts the worker.
	Run() error

	// StartJob schedules job execution on this worker.
	StartJob(Job) error

	// Capacity returns worker free slots for
	// job execution.
	Capacity() int

	// GetAddr returns remote worker server address.
	Addr() string

	// GetHost returns workers host information.
	Host() HostInfo

	// GetUsage returns worker usage statistics.
	Usage() []Usage
}

// HostInfo holds host information about worker.
type HostInfo struct {
	ID                   string `json:"id"`
	Addr                 string `json:"addr"`
	Hostname             string `json:"hostname"`
	Uptime               uint64 `json:"uptime"`
	BootTime             uint64 `json:"boot_time"`
	Procs                uint64 `json:"procs"`
	Os                   string `json:"os"`
	Platform             string `json:"platform"`
	PlatformFamily       string `json:"platform_family"`
	PlatformVersion      string `json:"platform_version"`
	KernelVersion        string `json:"kernel_version"`
	KernelArch           string `json:"kernel_arch"`
	VirtualizationSystem string `json:"virtualization_system"`
	VirtualizationRole   string `json:"virtualization_role"`
	HostID               string `json:"host_id"`
	MaxConcurrency       uint64 `json:"max_concurrency"`
}

// Usage represents worker usage stats.
type Usage struct {
	ID          string    `json:"id"`
	Addr        string    `json:"addr"`
	CPU         int32     `json:"cpu"`
	Mem         int32     `json:"mem"`
	JobsMax     int32     `json:"jobs_max"`
	JobsRunning int32     `json:"jobs_running"`
	Timestamp   time.Time `json:"timestamp"`
}
