package app

import (
	"context"
	"crypto/tls"
	"fmt"
	"sync"
	"time"

	"github.com/golang/protobuf/ptypes/empty"
	"github.com/jkuri/abstruse/internal/core"
	"github.com/jkuri/abstruse/internal/server/options"
	pb "github.com/jkuri/abstruse/proto"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
)

// worker represent gRPC worker client.
type worker struct {
	id      string
	mu      sync.Mutex
	max     int32
	running int32
	addr    string
	host    core.HostInfo
	usage   []core.Usage
	conn    *grpc.ClientConn
	cli     pb.APIClient
	logger  *zap.SugaredLogger
	app     *App
}

func newWorker(addr, id string, opts *options.Options, logger *zap.SugaredLogger, app *App) (core.Worker, error) {
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

	return worker{
		id:     id,
		addr:   addr,
		conn:   conn,
		cli:    cli,
		logger: logger,
		app:    app,
	}, nil
}

func (w worker) ID() string {
	return w.id
}

func (w worker) Run() error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	defer w.conn.Close()

	info, err := w.HostInfo(ctx)
	if err != nil {
		return err
	}
	w.host = hostInfo(info)
	w.max = int32(w.host.MaxConcurrency)
	w.logger.Infof("connected to worker %s %s", w.ID, w.addr)
	w.EmitData()
	// w.app.scheduler.addWorker(w.ID)

	ch := make(chan error)

	go func() {
		if err := w.UsageStats(context.Background()); err != nil {
			ch <- err
		}
	}()

	err = <-ch
	w.logger.Infof("closed connection to worker %s %s", w.ID, w.addr)
	return err
}

func (w worker) StartJob(job core.Job) error {
	return nil
}

func (w worker) Capacity() int {
	w.mu.Lock()
	defer w.mu.Unlock()
	return int(w.max - w.running)
}

// Capacity gRPC
// func (w *worker) Capacity(ctx context.Context) error {
// 	stream, err := w.cli.Capacity(ctx)
// 	if err != nil {
// 		return err
// 	}
// 	defer stream.CloseSend()
// 	for {
// 		data, err := stream.Recv()
// 		if err != nil {
// 			return err
// 		}
// 		w.mu.Lock()
// 		w.max, w.running = int32(data.GetMax()), int32(data.GetRunning())
// 		w.mu.Unlock()
// 		w.app.scheduler.setSize(w.app.getCapacity())
// 		w.EmitUsage()
// 	}
// }

// HostInfo returns worker host info.
func (w *worker) HostInfo(ctx context.Context) (*pb.HostInfoReply, error) {
	info, err := w.cli.HostInfo(ctx, &empty.Empty{})
	return info, err
}

func hostInfo(info *pb.HostInfoReply) core.HostInfo {
	return core.HostInfo{
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

// EmitUsage broadcast workers usage info.
func (w worker) EmitUsage() {
	if len(w.usage) < 1 {
		return
	}
	usage := w.usage[len(w.usage)-1]
	w.app.ws.Broadcast("/subs/workers_usage", map[string]interface{}{
		"id":           w.ID,
		"addr":         w.addr,
		"cpu":          usage.CPU,
		"mem":          usage.Mem,
		"jobs_max":     w.max,
		"jobs_running": w.running,
		"timestamp":    time.Now(),
	})
}

// UsageStats gRPC stream.
func (w worker) UsageStats(ctx context.Context) error {
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
		usage := core.Usage{
			ID:          w.id,
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

// GetAddr returns remote address.
func (w worker) GetAddr() string {
	return w.addr
}

// GetHost returns host info.
func (w worker) GetHost() core.HostInfo {
	return w.host
}

// GetUsage returns worker usage.
func (w worker) GetUsage() []core.Usage {
	return w.usage
}

// EmitData broadcast newly created worker via websocket.
func (w worker) EmitData() {
	w.app.ws.Broadcast("/subs/workers_add", map[string]interface{}{
		"id":    w.ID,
		"addr":  w.GetAddr(),
		"host":  w.GetHost(),
		"usage": w.GetUsage(),
	})
}

// EmitDeleted broadcast disconnected worker via websocket.
func (w worker) EmitDeleted() {
	w.app.ws.Broadcast("/subs/workers_delete", map[string]interface{}{
		"id":   w.ID,
		"addr": w.GetAddr(),
	})
}
