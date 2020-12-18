package stats

import (
	"path"
	"sync"
	"time"

	"github.com/bleenco/abstruse/pkg/stats"
	"github.com/bleenco/abstruse/server/core"
	"github.com/bleenco/abstruse/server/ws"
)

// New returns new StatsService instance.
func New(ws *ws.Server, scheduler core.Scheduler) core.StatsService {
	s := &statsService{ws: ws, scheduler: scheduler}
	go s.run()
	return s
}

type statsService struct {
	mu        sync.Mutex
	ws        *ws.Server
	history   []core.Usage
	stats     []core.SchedulerStats
	scheduler core.Scheduler
}

// GetHistory returns server usage history.
func (s *statsService) GetHistory() ([]core.Usage, []core.SchedulerStats) {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.history, s.stats
}

func (s *statsService) SchedulerStatus() bool {
	return s.scheduler.IsRunning()
}

// run starts stats service ticker and broadcast stats
// data every 5 seconds.
func (s *statsService) run() error {
	ticker := time.NewTicker(5 * time.Second)
	for range ticker.C {
		s.handleUsage()
	}

	return nil
}

func (s *statsService) handleUsage() {
	cpu, mem := stats.GetUsageStats()
	usage := core.Usage{CPU: cpu, Mem: mem, Timestamp: time.Now()}
	stats := s.scheduler.Stats()

	s.mu.Lock()
	s.history = append(s.history, usage)
	if len(s.history) > core.StatsHistoryCount {
		d := len(s.history) - core.StatsHistoryCount
		s.history = append(s.history[:d], s.history[d+1:]...)
	}

	s.stats = append(s.stats, stats)
	if len(s.stats) > core.StatsHistoryCount {
		d := len(s.stats) - core.StatsHistoryCount
		s.stats = append(s.stats[:d], s.stats[d+1:]...)
	}
	s.mu.Unlock()

	sub := path.Clean(path.Join("/subs", "serverusage"))
	event := map[string]interface{}{
		"cpu":     cpu,
		"mem":     mem,
		"queued":  stats.Queued,
		"pending": stats.Pending,
		"workers": stats.Workers,
		"max":     stats.Max,
		"running": stats.Running,
	}
	s.ws.App.Broadcast(sub, event)
}
