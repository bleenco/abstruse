package service

import (
	"github.com/jkuri/abstruse/pkg/core"
	"github.com/jkuri/abstruse/pkg/server/app"
)

// WorkerService comment
type WorkerService struct {
	app *app.App
}

// WorkerData struct
type WorkerData struct {
	ID    string        `json:"id"`
	Addr  string        `json:"addr"`
	Host  core.HostInfo `json:"host"`
	Usage []core.Usage  `json:"usage"`
}

// NewWorkerService returns new intsance of worker service.
func NewWorkerService(app *app.App) WorkerService {
	return WorkerService{app}
}

// GetWorkers comment.
func (s *WorkerService) GetWorkers() []WorkerData {
	var data []WorkerData
	for id, worker := range s.app.GetWorkers() {
		data = append(data, WorkerData{id, worker.Addr(), worker.Host(), worker.Usage()})
	}
	return data
}
