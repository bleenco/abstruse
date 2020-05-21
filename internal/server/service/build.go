package service

import (
	"github.com/jkuri/abstruse/internal/server/grpc"
	"go.uber.org/zap"
)

type BuildService interface {
	StartJob() bool
}

type DefaultBuildService struct {
	logger  *zap.SugaredLogger
	grpcApp *grpc.App
}

func NewBuildService(logger *zap.Logger, grpcApp *grpc.App) BuildService {
	return &DefaultBuildService{
		logger:  logger.With(zap.String("type", "BuildService")).Sugar(),
		grpcApp: grpcApp,
	}
}

func (s *DefaultBuildService) StartJob() bool {
	return s.grpcApp.StartJob()
}
