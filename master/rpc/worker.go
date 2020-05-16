package rpc

import (
	"context"
	"crypto/tls"
	"fmt"
	"time"

	"github.com/jkuri/abstruse/master/websocket"

	"github.com/jkuri/abstruse/pkg/logger"
	"github.com/jkuri/abstruse/pkg/security"
	pb "github.com/jkuri/abstruse/proto"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
)

// Worker represent gRPC worker client.
type Worker struct {
	addr  string
	host  HostInfo
	conn  *grpc.ClientConn
	cli   pb.ApiClient
	usage []Usage
	log   *logger.Logger
}

// NewClient returns new instance of gRPC client.
func newWorker(addr string, config Config, log *logger.Logger) (*Worker, error) {
	if config.Cert == "" || config.Key == "" {
		return nil, fmt.Errorf("certificate and key must be specified")
	}
	if err := security.CheckAndGenerateCert(config.Cert, config.Key); err != nil {
		return nil, err
	}

	opts := []grpc.DialOption{}
	certificate, err := tls.LoadX509KeyPair(config.Cert, config.Key)
	if err != nil {
		return nil, err
	}

	creds := credentials.NewTLS(&tls.Config{
		Certificates:       []tls.Certificate{certificate},
		InsecureSkipVerify: true,
	})

	opts = append(opts, grpc.WithTransportCredentials(creds))

	conn, err := grpc.Dial(addr, opts...)
	if err != nil {
		return nil, err
	}
	cli := pb.NewApiClient(conn)

	return &Worker{
		addr: addr,
		conn: conn,
		cli:  cli,
		log:  log,
	}, nil
}

func (w *Worker) run() error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	info, err := w.HostInfo(ctx)
	if err != nil {
		return err
	}
	w.host = hostInfo(info)
	w.log.Infof("connected to worker %s %s", w.host.CertID, w.conn.Target())
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
	w.log.Infof("closed connection to worker %s %s", w.host.CertID, w.conn.Target())
	return err
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
	websocket.WSApp.Broadcast("/subs/workers_add", map[string]interface{}{
		"addr":  w.GetAddr(),
		"host":  w.GetHost(),
		"usage": w.GetUsage(),
	})
}

// EmitDeleted broadcast disconnected worker via websocket.
func (w *Worker) EmitDeleted() {
	websocket.WSApp.Broadcast("/subs/workers_delete", map[string]interface{}{
		"addr": w.GetAddr(),
		"host": w.GetHost(),
	})
}
