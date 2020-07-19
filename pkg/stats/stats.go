package stats

import "github.com/shirou/gopsutil/host"

// GetUsageStats returns system utilization stats.
func GetUsageStats() (int32, int32) {
	return getCPUPercent(), getMemoryPercent()
}

// GetHostStats returns system information.
func GetHostStats() (*host.InfoStat, error) {
	return host.Info()
}
