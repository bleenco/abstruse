package app

import (
	"context"
	"crypto/tls"
	"fmt"
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

// worker represent gRPC worker client.
type worker struct {
	mu sync.Mutex

	id      string
	max     int32
	running int32
	addr    string
	host    core.HostInfo
	usage   []core.Usage

	conn   *grpc.ClientConn
	cli    pb.APIClient
	logger *zap.SugaredLogger
	app    *App
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

	host, err := w.hostInfo(ctx)
	if err != nil {
		return err
	}
	w.host = host
	w.max = int32(w.host.MaxConcurrency)
	w.logger.Infof("connected to worker %s %s", w.id, w.addr)
	w.emitData()
	w.app.workers[w.id] = w
	// w.app.scheduler.addWorker(w.ID)

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

func (w worker) StartJob(job core.Job) error {
	return nil
}

func (w worker) Capacity() int {
	w.mu.Lock()
	defer w.mu.Unlock()
	return int(w.max - w.running)
}

// GetAddr returns remote address.
func (w worker) Addr() string {
	return w.addr
}

// GetHost returns host info.
func (w worker) Host() core.HostInfo {
	return w.host
}

// GetUsage returns worker usage.
func (w worker) Usage() []core.Usage {
	return w.usage
}

// usageStats gRPC stream.
func (w worker) usageStats(ctx context.Context) error {
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

// hostInfo returns remote workers systme information.
func (w *worker) hostInfo(ctx context.Context) (core.HostInfo, error) {
	info, err := w.cli.HostInfo(ctx, &empty.Empty{})
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
	}, err
}

// emitData broadcast newly created worker via websocket.
func (w worker) emitData() {
	w.app.ws.Broadcast("/subs/workers_add", map[string]interface{}{
		"id":    w.id,
		"addr":  w.Addr(),
		"host":  w.Host(),
		"usage": w.Usage(),
	})
}

// emitUsage broadcast workers usage info.
func (w worker) emitUsage() {
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
