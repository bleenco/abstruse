package app

import (
	"context"
	"crypto/tls"
	"fmt"
	"io"
	"sync"
	"time"

	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/empty"
	"github.com/jkuri/abstruse/internal/core"
	"github.com/jkuri/abstruse/internal/server/options"
	pb "github.com/jkuri/abstruse/proto"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
)

// Worker represent gRPC worker client.
type Worker struct {
	mu sync.Mutex

	id      string
	max     int
	running int
	addr    string
	host    core.HostInfo
	usage   []core.Usage

	conn   *grpc.ClientConn
	cli    pb.APIClient
	logger *zap.SugaredLogger
	app    *App
}

func newWorker(addr, id string, opts *options.Options, logger *zap.SugaredLogger, app *App) (*Worker, error) {
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
		id:     id,
		addr:   addr,
		conn:   conn,
		cli:    cli,
		logger: logger,
		app:    app,
	}, nil
}

// ID returns workers id.
func (w *Worker) ID() string {
	return w.id
}

// Run starts the worker.
func (w *Worker) Run() error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	defer w.conn.Close()

	host, err := w.hostInfo(ctx)
	if err != nil {
		return err
	}
	w.host = host
	w.max = int(w.host.MaxConcurrency)
	w.logger.Infof("connected to worker %s %s with capacity %d", w.id, w.addr, w.max)
	w.emitData()
	w.app.workers[w.id] = w
	w.app.scheduler.AddWorker(w)

	ch := make(chan error)

	go func() {
		if err := w.usageStats(context.Background()); err != nil {
			ch <- err
		}
	}()

	err = <-ch
	w.logger.Infof("closed connection to worker %s %s", w.id, w.addr)
	return err
}

// SetCapacity sets current capacity.
func (w *Worker) SetCapacity(n int) {
	w.mu.Lock()
	defer w.mu.Unlock()
	w.running = n
}

// Capacity returns current capacity.
func (w *Worker) Capacity() int {
	w.mu.Lock()
	defer w.mu.Unlock()
	return int(w.max - w.running)
}

// Addr returns remote address.
func (w *Worker) Addr() string {
	return w.addr
}

// Host returns host info.
func (w *Worker) Host() core.HostInfo {
	return w.host
}

// Usage returns worker usage.
func (w *Worker) Usage() []core.Usage {
	return w.usage
}

// usageStats gRPC stream.
func (w *Worker) usageStats(ctx context.Context) error {
	stream, err := w.cli.Usage(ctx)
	if err != nil {
		return err
	}
	defer stream.CloseSend()

	for {
		stats, err := stream.Recv()
		if err != nil {
			return err
		}
		timestamp, _ := ptypes.Timestamp(stats.GetTimestamp())
		usage := core.Usage{
			ID:          w.id,
			Addr:        w.addr,
			CPU:         stats.GetCpu(),
			Mem:         stats.GetMem(),
			JobsMax:     int32(w.max),
			JobsRunning: int32(w.running),
			Timestamp:   timestamp,
		}

		w.mu.Lock()
		w.usage = append(w.usage, usage)
		if len(w.usage) > 120 {
			// TODO save to db.
			w.usage = w.usage[1:]
		}
		w.emitUsage()
		w.mu.Unlock()
		w.app.workers[w.id] = w
	}
}

// logOutput gRPC stream.
func (w *Worker) logOutput(ctx context.Context, jobID, buildID uint) error {
	job := &pb.Job{Id: uint64(jobID), BuildId: uint64(buildID)}
	stream, err := w.cli.JobLog(ctx, job)
	if err != nil {
		return err
	}
	defer stream.CloseSend()

	for {
		output, err := stream.Recv()
		if err != nil {
			if err == io.EOF {
				return nil
			}
			return err
		}
		id, log := uint(output.GetId()), string(output.GetContent())
		w.app.scheduler.mu.Lock()
		if j, ok := w.app.scheduler.pending[id]; ok {
			j.Log = append(j.Log, log)
		}
		w.app.scheduler.mu.Unlock()
	}
}

// hostInfo returns remote workers systme information.
func (w *Worker) hostInfo(ctx context.Context) (core.HostInfo, error) {
	info, err := w.cli.HostInfo(ctx, &empty.Empty{})
	return core.HostInfo{
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
		MaxConcurrency:       info.GetMaxConcurrency(),
	}, err
}

// emitData broadcast newly created worker via websocket.
func (w *Worker) emitData() {
	w.app.ws.Broadcast("/subs/workers_add", map[string]interface{}{
		"id":    w.id,
		"addr":  w.Addr(),
		"host":  w.Host(),
		"usage": w.Usage(),
	})
}

// emitUsage broadcast workers usage info.
func (w *Worker) emitUsage() {
	if len(w.usage) < 1 {
		return
	}
	usage := w.usage[len(w.usage)-1]
	w.app.ws.Broadcast("/subs/workers_usage", map[string]interface{}{
		"id":           w.id,
		"addr":         w.addr,
		"cpu":          usage.CPU,
		"mem":          usage.Mem,
		"jobs_max":     w.max,
		"jobs_running": w.running,
		"timestamp":    time.Now(),
	})
}
