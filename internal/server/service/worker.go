package service

import (
	"path"

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
	for addr, worker := range workers {
		data = append(data, workerData{path.Base(addr), worker.GetHost(), worker.GetUsage()})
	}
	return data
}
