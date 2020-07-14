package stats

import "github.com/shirou/gopsutil/mem"

func getMemoryPercent() int32 {
	stat, err := mem.VirtualMemory()
	if err != nil {
		return 0
	}
	return int32(stat.UsedPercent)
}
