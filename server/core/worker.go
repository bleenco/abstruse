package core

import (
	"context"
	"crypto/tls"
	"fmt"
	"sync"
	"time"

	"github.com/bleenco/abstruse/internal/auth"
	pb "github.com/bleenco/abstruse/pb"
	"github.com/bleenco/abstruse/server/config"
	"github.com/bleenco/abstruse/server/ws"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"google.golang.org/protobuf/types/known/emptypb"
)

type (
	// WorkerRegistry represents registry of operational worker nodes.
	WorkerRegistry interface {
		// Add adds new worker node to the registry.
		Add(*Worker) error

		// Delete removes worker node from the registry.
		Delete(string) error

		// List returns list of active worker nodes in registry.
		List() ([]*Worker, error)
	}

	// Worker represents connected worker node.
	Worker struct {
		sync.Mutex
		ID       string
		Addr     string
		Max      int
		Running  int
		Host     HostInfo
		Usage    []WorkerUsage
		Conn     *grpc.ClientConn
		CLI      pb.APIClient
		Registry WorkerRegistry
		WS       *ws.App
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
		MaxParallel          uint64    `json:"maxParallel"`
		ConnectedAt          time.Time `json:"connectedAt"`
	}

	// WorkerUsage holds remote worker node usage information.
	WorkerUsage struct {
		CPU       int       `json:"cpu"`
		Mem       int       `json:"mem"`
		Max       int       `json:"jobsMax"`
		Running   int       `json:"jobsRunning"`
		Timestamp time.Time `json:"timestamp"`
	}
)

// NewWorker returns new worker instance.
func NewWorker(id, addr string, config *config.Config, registry WorkerRegistry, ws *ws.App) (*Worker, error) {
	if config.TLS.Cert == "" || config.TLS.Key == "" {
		return nil, fmt.Errorf("certificate and key must be specified")
	}

	grpcOpts := []grpc.DialOption{}
	certificate, err := tls.LoadX509KeyPair(config.TLS.Cert, config.TLS.Key)
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
		ID:       id,
		Addr:     addr,
		Conn:     conn,
		CLI:      cli,
		Registry: registry,
		WS:       ws,
	}, nil
}

// Connect attept connect to worker node and retrieve
// worker information.
func (w *Worker) Connect(ctx context.Context) error {
	info, err := w.CLI.Connect(ctx, &emptypb.Empty{})
	if err != nil {
		return err
	}

	w.Host = HostInfo{
		ID:                   info.GetId(),
		Addr:                 info.GetAddr(),
		Hostname:             info.GetHostname(),
		Uptime:               info.GetUptime(),
		BootTime:             info.GetBootTime(),
		Procs:                info.GetProcs(),
		Os:                   info.GetOs(),
		Platform:             info.GetPlatform(),
		PlatformFamily:       info.GetPlatformFamily(),
		PlatformVersion:      info.GetPlatformVersion(),
		KernelVersion:        info.GetKernelVersion(),
		KernelArch:           info.GetKernelArch(),
		VirtualizationSystem: info.GetVirtualizationSystem(),
		VirtualizationRole:   info.GetVirtualizationRole(),
		HostID:               info.GetHostID(),
		MaxParallel:          info.GetMaxParallel(),
		ConnectedAt:          time.Now(),
	}
	w.Max = int(info.GetMaxParallel())

	go func() {
		if err := w.usageStats(ctx); err != nil {
			w.emitDisconnected()
			w.Registry.Delete(w.Host.ID)
		}
	}()

	w.emitData()

	return nil
}

// StartJob starts the job.
func (w *Worker) StartJob(job *pb.Job) (*pb.Job, error) {
	stream, err := w.CLI.StartJob(context.Background(), job)
	if err != nil {
		return job, err
	}

	w.Lock()
	w.Running++
	w.Unlock()

	defer func() {
		stream.CloseSend()
		w.Lock()
		w.Running--
		w.Unlock()
	}()

	for {
		resp, err := stream.Recv()
		if err != nil {
			break
		}

		switch resp.GetType() {
		case pb.JobResp_Log:
			id, log := resp.GetId(), string(resp.GetContent())
			job.Log = append(job.Log, log)
			w.WS.Broadcast(fmt.Sprintf("/subs/logs/%d", id), map[string]interface{}{
				"id":  id,
				"log": log,
			})
		case pb.JobResp_Done:
			status := "unknown"
			switch resp.GetStatus() {
			case pb.JobResp_StatusUnknown:
				status = "unknown"
			case pb.JobResp_StatusFailing:
				status = "failing"
			case pb.JobResp_StatusPassing:
				status = "passing"
			case pb.JobResp_StatusQueued:
				status = "queued"
			case pb.JobResp_StatusRunning:
				status = "running"
			}
			job.Status = status
			break
		}
	}

	return job, nil
}

// StopJob stops the running job.
func (w *Worker) StopJob(job *pb.Job) (bool, error) {
	res, err := w.CLI.StopJob(context.Background(), job)
	if err != nil {
		return false, err
	}
	return res.GetStopped(), nil
}

// usageStats gRPC stream.
func (w *Worker) usageStats(ctx context.Context) error {
	stream, err := w.CLI.Usage(ctx)
	if err != nil {
		return err
	}
	defer stream.CloseSend()

	for {
		stats, err := stream.Recv()
		if err != nil {
			return err
		}

		w.Lock()
		usage := WorkerUsage{
			CPU:       int(stats.GetCpu()),
			Mem:       int(stats.GetMem()),
			Max:       w.Max,
			Running:   w.Running,
			Timestamp: time.Now(),
		}
		w.Usage = append(w.Usage, usage)
		if len(w.Usage) > 120 {
			w.Usage = w.Usage[len(w.Usage)-120:]
		}
		w.emitUsage()
		w.Unlock()
	}
}

// emit broadcasts data via websocket.
func (w *Worker) emit(sub string, data map[string]interface{}) {
	w.WS.Broadcast(sub, data)
}

// emitData broadcast newly created worker via websocket.
func (w *Worker) emitData() {
	w.WS.Broadcast("/subs/workers_add", map[string]interface{}{
		"id":    w.ID,
		"addr":  w.Addr,
		"host":  w.Host,
		"usage": w.Usage,
	})
}

// emitDisconnected broadcast disconnected worker via websocket
func (w *Worker) emitDisconnected() {
	w.WS.Broadcast("/subs/workers_delete", map[string]interface{}{
		"id": w.ID,
	})
}

// emitUsage broadcast workers usage info.
func (w *Worker) emitUsage() {
	if len(w.Usage) < 1 {
		return
	}
	usage := w.Usage[len(w.Usage)-1]
	w.WS.Broadcast("/subs/workers_usage", map[string]interface{}{
		"id":          w.ID,
		"addr":        w.Addr,
		"cpu":         usage.CPU,
		"mem":         usage.Mem,
		"jobsMax":     w.Max,
		"jobsRunning": w.Running,
		"timestamp":   time.Now(),
	})
}
