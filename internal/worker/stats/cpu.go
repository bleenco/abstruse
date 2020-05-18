package stats

import "github.com/shirou/gopsutil/cpu"

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
