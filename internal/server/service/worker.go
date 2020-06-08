package service

import (
	"github.com/jkuri/abstruse/internal/server/app"
	"go.uber.org/zap"
)

// WorkerService comment
type WorkerService interface {
	GetWorkers() []WorkerData
}

// DefaultWorkerService comment
type DefaultWorkerService struct {
	logger *zap.SugaredLogger
	app    *app.App
}

// WorkerData struct
type WorkerData struct {
	ID    string       `json:"id"`
	Addr  string       `json:"addr"`
	Host  app.HostInfo `json:"host"`
	Usage []app.Usage  `json:"usage"`
}

// NewWorkerService returns new intsance of worker service.
func NewWorkerService(logger *zap.Logger, app *app.App) WorkerService {
	return &DefaultWorkerService{
		logger: logger.With(zap.String("type", "WorkerService")).Sugar(),
		app:    app,
	}
}

// GetWorkers comment.
func (s *DefaultWorkerService) GetWorkers() []WorkerData {
	var data []WorkerData
	for id, worker := range s.app.Workers {
		data = append(data, WorkerData{id, worker.GetAddr(), worker.GetHost(), worker.GetUsage()})
	}
	return data
}
