package worker

import (
	"github.com/shirou/gopsutil/cpu"
	"github.com/shirou/gopsutil/mem"
)

func getWorkerUsageStats() (int32, int32) {
	return getCPUPercent(), getMemoryPercent()
}

func getCPUPercent() int32 {
	percent, err := cpu.Percent(0, true)
	if err != nil {
		return 0
	}
	total := func() int {
		var t float64
		for _, p := range percent {
			t += p
		}
		return int(int(t) / len(percent))
	}()

	return int32(total)
}

func getMemoryPercent() int32 {
	stat, err := mem.VirtualMemory()
	if err != nil {
		return 0
	}
	return int32(stat.UsedPercent)
}
