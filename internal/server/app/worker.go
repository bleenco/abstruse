package app

import (
	"context"
	"crypto/tls"
	"fmt"
	"sync"
	"time"

	"github.com/golang/protobuf/ptypes/empty"
	"github.com/jkuri/abstruse/internal/server/options"
	"github.com/jkuri/abstruse/internal/server/websocket"
	pb "github.com/jkuri/abstruse/proto"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
)

// Worker represent gRPC worker client.
type Worker struct {
	ID      string
	mu      sync.Mutex
	max     int
	running int
	addr    string
	host    HostInfo
	conn    *grpc.ClientConn
	cli     pb.APIClient
	ws      *websocket.App
	usage   []Usage
	logger  *zap.SugaredLogger
	ready   bool
	app     *App

	jobch jobChannel
	queue jobQueue
	quit  chan struct{}
}

// HostInfo holds host information about worker.
type HostInfo struct {
	ID                   string `json:"id"`
	Addr                 string `json:"addr"`
	Hostname             string `json:"hostname"`
	Uptime               uint64 `json:"uptime"`
	BootTime             uint64 `json:"boot_time"`
	Procs                uint64 `json:"procs"`
	Os                   string `json:"os"`
	Platform             string `json:"platform"`
	PlatformFamily       string `json:"platform_family"`
	PlatformVersion      string `json:"platform_version"`
	KernelVersion        string `json:"kernel_version"`
	KernelArch           string `json:"kernel_arch"`
	VirtualizationSystem string `json:"virtualization_system"`
	VirtualizationRole   string `json:"virtualization_role"`
	HostID               string `json:"host_id"`
	MaxConcurrency       uint64 `json:"max_concurrency"`
}

// Usage represents worker usage stats.
type Usage struct {
	ID          string    `json:"id"`
	Addr        string    `json:"addr"`
	CPU         int32     `json:"cpu"`
	Mem         int32     `json:"mem"`
	JobsMax     int32     `json:"jobs_max"`
	JobsRunning int32     `json:"jobs_running"`
	Timestamp   time.Time `json:"timestamp"`
}

func newWorker(addr, id string, opts *options.Options, ws *websocket.App, logger *zap.SugaredLogger, app *App) (*Worker, error) {
	logger = logger.With(zap.String("worker", addr))
	if opts.TLS.Cert == "" || opts.TLS.Key == "" {
		return nil, fmt.Errorf("certificate and key must be specified")
	}

	grpcOpts := []grpc.DialOption{}
	certificate, err := tls.LoadX509KeyPair(opts.TLS.Cert, opts.TLS.Key)
	if err != nil {
		return nil, err
	}

	creds := credentials.NewTLS(&tls.Config{
		Certificates:       []tls.Certificate{certificate},
		InsecureSkipVerify: true,
	})

	grpcOpts = append(grpcOpts, grpc.WithTransportCredentials(creds))

	conn, err := grpc.Dial(addr, grpcOpts...)
	if err != nil {
		return nil, err
	}
	cli := pb.NewAPIClient(conn)

	return &Worker{
		ID:     id,
		addr:   addr,
		conn:   conn,
		cli:    cli,
		ws:     ws,
		logger: logger,
		app:    app,
	}, nil
}

func (w *Worker) run() error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	defer w.conn.Close()

	info, err := w.HostInfo(ctx)
	if err != nil {
		return err
	}
	w.host = hostInfo(info)
	w.max = int(w.host.MaxConcurrency)
	w.ready = true
	w.logger.Infof("connected to worker %s %s", w.ID, w.addr)
	w.EmitData()

	ch := make(chan error)

	go func() {
		if err := w.UsageStats(context.Background()); err != nil {
			ch <- err
		}
	}()

	go func() {
		if err := w.Capacity(context.Background()); err != nil {
			ch <- err
		}
	}()

	err = <-ch
	w.ready = false
	w.logger.Infof("closed connection to worker %s %s", w.ID, w.addr)
	return err
}

func (w *Worker) start(queue jobQueue) {
	w.queue = queue
	w.jobch = make(jobChannel)
	w.quit = make(chan struct{})

	go func() {
		for {
			w.queue <- w.jobch
			select {
			case job := <-w.jobch:
				w.logger.Debugf("job: %+v", job)
			case <-w.quit:
				close(w.jobch)
				return
			}
		}
	}()
}

func (w *Worker) stop() {
	close(w.quit)
}

// GetAddr returns remote address.
func (w *Worker) GetAddr() string {
	return w.addr
}

// GetHost returns host info.
func (w *Worker) GetHost() HostInfo {
	return w.host
}

// GetUsage returns worker usage.
func (w *Worker) GetUsage() []Usage {
	return w.usage
}

// EmitData broadcast newly created worker via websocket.
func (w *Worker) EmitData() {
	w.ws.Broadcast("/subs/workers_add", map[string]interface{}{
		"id":    w.ID,
		"addr":  w.GetAddr(),
		"host":  w.GetHost(),
		"usage": w.GetUsage(),
	})
}

// EmitDeleted broadcast disconnected worker via websocket.
func (w *Worker) EmitDeleted() {
	w.ws.Broadcast("/subs/workers_delete", map[string]interface{}{
		"id":   w.ID,
		"addr": w.GetAddr(),
	})
}

// EmitUsage broadcast workers usage info.
func (w *Worker) EmitUsage() {
	if len(w.usage) < 1 {
		return
	}
	usage := w.usage[len(w.usage)-1]
	w.ws.Broadcast("/subs/workers_usage", map[string]interface{}{
		"id":           w.ID,
		"addr":         w.addr,
		"cpu":          usage.CPU,
		"mem":          usage.Mem,
		"jobs_max":     w.max,
		"jobs_running": w.running,
		"timestamp":    time.Now(),
	})
}

// Capacity gRPC
func (w *Worker) Capacity(ctx context.Context) error {
	stream, err := w.cli.Capacity(ctx)
	if err != nil {
		return err
	}
	defer stream.CloseSend()
	for {
		data, err := stream.Recv()
		if err != nil {
			return err
		}
		w.mu.Lock()
		w.max, w.running = int(data.GetMax()), int(data.GetRunning())
		w.mu.Unlock()
		w.app.scheduler.setSize(w.app.getCapacity())
		w.EmitUsage()
	}
}

// HostInfo returns worker host info.
func (w *Worker) HostInfo(ctx context.Context) (*pb.HostInfoReply, error) {
	info, err := w.cli.HostInfo(ctx, &empty.Empty{})
	return info, err
}

func hostInfo(info *pb.HostInfoReply) HostInfo {
	return HostInfo{
		info.GetId(),
		info.GetAddr(),
		info.GetHostname(),
		info.GetUptime(),
		info.GetBootTime(),
		info.GetProcs(),
		info.GetOs(),
		info.GetPlatform(),
		info.GetPlatformFamily(),
		info.GetPlatformVersion(),
		info.GetKernelVersion(),
		info.GetKernelArch(),
		info.GetVirtualizationSystem(),
		info.GetVirtualizationSystem(),
		info.GetHostname(),
		info.GetMaxConcurrency(),
	}
}

// UsageStats gRPC stream.
func (w *Worker) UsageStats(ctx context.Context) error {
	stream, err := w.cli.UsageStats(ctx)
	if err != nil {
		return err
	}
	defer stream.CloseSend()

	for {
		stats, err := stream.Recv()
		if err != nil {
			return err
		}
		usage := Usage{
			ID:          w.ID,
			Addr:        w.addr,
			CPU:         stats.GetCpu(),
			Mem:         stats.GetMem(),
			JobsMax:     int32(w.max),
			JobsRunning: int32(w.running),
			Timestamp:   time.Now(),
		}

		w.mu.Lock()
		w.usage = append(w.usage, usage)
		if len(w.usage) > 60 {
			// TODO save to db.
			w.usage = w.usage[1:]
		}
		w.EmitUsage()
		w.mu.Unlock()
	}
}
