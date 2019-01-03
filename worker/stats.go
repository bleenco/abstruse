package worker

import (
	"github.com/shirou/gopsutil/cpu"
	"github.com/shirou/gopsutil/mem"
)

func getWorkerUsageStats() (int32, int32, int32, int32) {
	return 4, 1, getCPUPercent(), getMemoryPercent()
}

func getCPUPercent() int32 {
	percent, err := cpu.Percent(0, false)
	if err != nil {
		return 0
	}
	return int32(percent[0])
}

func getMemoryPercent() int32 {
	stat, err := mem.VirtualMemory()
	if err != nil {
		panic(err)
	}
	return int32(stat.UsedPercent)
}
