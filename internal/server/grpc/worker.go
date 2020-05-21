package grpc

import (
	"context"
	"crypto/tls"
	"fmt"
	"time"

	"github.com/jkuri/abstruse/internal/pkg/certgen"
	"github.com/jkuri/abstruse/internal/server/websocket"
	pb "github.com/jkuri/abstruse/proto"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
)

// Worker represent gRPC worker client.
type Worker struct {
	id      string
	addr    string
	host    HostInfo
	conn    *grpc.ClientConn
	cli     pb.ApiClient
	ws      *websocket.App
	usage   []Usage
	logger  *zap.SugaredLogger
	max     uint64
	current uint64
	ready   bool
}

func newWorker(addr, id string, opts *Options, ws *websocket.App, logger *zap.SugaredLogger) (*Worker, error) {
	logger = logger.With(zap.String("worker", addr))
	if opts.Cert == "" || opts.Key == "" {
		return nil, fmt.Errorf("certificate and key must be specified")
	}
	if err := certgen.CheckAndGenerateCert(opts.Cert, opts.Key); err != nil {
		return nil, err
	}

	grpcOpts := []grpc.DialOption{}
	certificate, err := tls.LoadX509KeyPair(opts.Cert, opts.Key)
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
	cli := pb.NewApiClient(conn)

	return &Worker{
		id:     id,
		addr:   addr,
		conn:   conn,
		cli:    cli,
		ws:     ws,
		logger: logger,
		ready:  false,
	}, nil
}

func (w *Worker) run() error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	defer w.conn.Close()

	info, err := w.HostInfo(ctx)
	if err != nil {
		return err
	}
	w.host = hostInfo(info)
	w.ready = true
	w.logger.Infof("connected to worker %s %s", w.id, w.addr)
	w.EmitData()

	ch := make(chan error)

	go func() {
		if err := w.Heartbeat(context.Background()); err != nil {
			ch <- err
		}
	}()

	go func() {
		if err := w.UsageStats(context.Background()); err != nil {
			ch <- err
		}
	}()

	err = <-ch
	w.ready = false
	w.logger.Infof("closed connection to worker %s %s", w.id, w.addr)
	return err
}

// GetAddr returns remote address.
func (w *Worker) GetAddr() string {
	return w.addr
}

// GetID returns workers cert identification.
func (w *Worker) GetID() string {
	return w.id
}

// GetHost returns host info.
func (w *Worker) GetHost() HostInfo {
	return w.host
}

// GetUsage returns worker usage.
func (w *Worker) GetUsage() []Usage {
	return w.usage
}

// IsReady returns if worker is ready to process jobs.
func (w *Worker) IsReady() bool {
	return w.ready
}

// EmitData broadcast newly created worker via websocket.
func (w *Worker) EmitData() {
	w.ws.Broadcast("/subs/workers_add", map[string]interface{}{
		"id":    w.GetID(),
		"addr":  w.GetAddr(),
		"host":  w.GetHost(),
		"usage": w.GetUsage(),
	})
}

// EmitDeleted broadcast disconnected worker via websocket.
func (w *Worker) EmitDeleted() {
	w.ws.Broadcast("/subs/workers_delete", map[string]interface{}{
		"id":   w.GetID(),
		"addr": w.GetAddr(),
		"host": w.GetHost(),
	})
}
