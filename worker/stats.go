package worker

import (
	"github.com/shirou/gopsutil/mem"
)

func getWorkerUsageStats() (int32, int32, int32, int32) {
	return 4, 1, getCPUPercent(), getMemoryPercent()
}

func getCPUPercent() int32 {
	// percent, err := cpu.Percent(time.Duration(1)*time.Second, false)
	// if err != nil {
	// 	panic(err)
	// }
	return int32(50)
}

func getMemoryPercent() int32 {
	stat, err := mem.VirtualMemory()
	if err != nil {
		panic(err)
	}
	return int32(stat.UsedPercent)
}
