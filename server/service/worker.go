package service

import "github.com/bleenco/abstruse/server/core"

// WorkerService is workers service.
type WorkerService struct {
	app *core.App
}

// WorkerData struct
type WorkerData struct {
	ID    string        `json:"id"`
	Addr  string        `json:"addr"`
	Host  core.HostInfo `json:"host"`
	Usage []core.Usage  `json:"usage"`
}

// NewWorkerService returns new instance of WorkerService.
func NewWorkerService(app *core.App) WorkerService {
	return WorkerService{
		app: app,
	}
}

// Find finds currently connected workers.
func (s *WorkerService) Find() []WorkerData {
	var workers []WorkerData
	for id, worker := range s.app.GetWorkers() {
		workers = append(workers, WorkerData{id, worker.Addr(), worker.Host(), worker.Usage()})
	}
	return workers
}
