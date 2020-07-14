package core

import (
	"crypto/tls"
	"fmt"
	"sync"
	"time"

	"github.com/bleenco/abstruse/internal/auth"
	pb "github.com/bleenco/abstruse/pb"
	"github.com/bleenco/abstruse/server/config"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
)

type (
	// Worker represents gRPC worker node client.
	Worker struct {
		mu     sync.Mutex
		id     string
		addr   string
		host   HostInfo
		usage  []Usage
		conn   *grpc.ClientConn
		cli    pb.APIClient
		logger *zap.SugaredLogger
	}

	// HostInfo holds host information about remote worker node.
	HostInfo struct {
		ID                   string    `json:"id"`
		Addr                 string    `json:"addr"`
		Hostname             string    `json:"hostname"`
		Uptime               uint64    `json:"uptime"`
		BootTime             uint64    `json:"bootTime"`
		Procs                uint64    `json:"procs"`
		Os                   string    `json:"os"`
		Platform             string    `json:"platform"`
		PlatformFamily       string    `json:"platformFamily"`
		PlatformVersion      string    `json:"platformVersion"`
		KernelVersion        string    `json:"kernelVersion"`
		KernelArch           string    `json:"kernelArch"`
		VirtualizationSystem string    `json:"virtualizationSystem"`
		VirtualizationRole   string    `json:"virtualizationRole"`
		HostID               string    `json:"hostID"`
		MaxConcurrency       uint64    `json:"maxConcurrency"`
		ConnectedAt          time.Time `json:"connectedAt"`
	}

	// Usage holds remote workers node usage information.
	Usage struct {
		CPU       int32     `json:"cpu"`
		Mem       int32     `json:"mem"`
		Max       int       `json:"max"`
		Running   int       `json:"running"`
		Timestamp time.Time `json:"timestamp"`
	}
)

// NewWorker initializes new worker and returns it.
func NewWorker(cfg *config.Config, logger *zap.Logger, id, addr string) (*Worker, error) {
	if cfg.TLS.Cert == "" || cfg.TLS.Key == "" {
		return nil, fmt.Errorf("certificate and key must be specified")
	}

	grpcOpts := []grpc.DialOption{}
	certificate, err := tls.LoadX509KeyPair(cfg.TLS.Cert, cfg.TLS.Key)
	if err != nil {
		return nil, err
	}

	creds := credentials.NewTLS(&tls.Config{
		Certificates:       []tls.Certificate{certificate},
		InsecureSkipVerify: true,
	})
	jwt, err := auth.GenerateWorkerJWT(id)
	if err != nil {
		return nil, err
	}
	auth := &auth.Authentication{
		Identifier: id,
		JWT:        jwt,
	}

	grpcOpts = append(grpcOpts, grpc.WithTransportCredentials(creds))
	grpcOpts = append(grpcOpts, grpc.WithPerRPCCredentials(auth))

	conn, err := grpc.Dial(addr, grpcOpts...)
	if err != nil {
		return nil, err
	}
	cli := pb.NewAPIClient(conn)

	return &Worker{
		id:     id,
		addr:   addr,
		conn:   conn,
		cli:    cli,
		logger: logger.With(zap.String("worker", id)).Sugar(),
	}, nil
}
