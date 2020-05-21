package service

import (
	"github.com/jkuri/abstruse/internal/server/grpc"
	"go.uber.org/zap"
)

type WorkerService interface {
	GetWorkers() []workerData
}

type DefaultWorkerService struct {
	logger  *zap.SugaredLogger
	grpcApp *grpc.App
}

type workerData struct {
	ID    string        `json:"id"`
	Addr  string        `json:"addr"`
	Host  grpc.HostInfo `json:"host"`
	Usage []grpc.Usage  `json:"usage"`
}

func NewWorkerService(logger *zap.Logger, grpcApp *grpc.App) WorkerService {
	return &DefaultWorkerService{
		logger:  logger.With(zap.String("type", "WorkerService")).Sugar(),
		grpcApp: grpcApp,
	}
}

func (s *DefaultWorkerService) GetWorkers() []workerData {
	var data []workerData
	workers := s.grpcApp.GetWorkers()
	for id, worker := range workers {
		data = append(data, workerData{id, worker.GetAddr(), worker.GetHost(), worker.GetUsage()})
	}
	return data
}
