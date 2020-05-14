package rpc

import (
	"context"
	"crypto/tls"
	"fmt"
	"time"

	"github.com/jkuri/abstruse/pkg/security"

	"github.com/jkuri/abstruse/pkg/logger"
	pb "github.com/jkuri/abstruse/proto"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
)

// Config defines gRPC client configuration.
type Config struct {
	Cert string `json:"cert"`
	Key  string `json:"key"`
}

// Client represent gRPC client.
type Client struct {
	Host   *HostInfo
	Conn   *grpc.ClientConn
	CLI    pb.ApiClient
	Data   Data
	config Config
	logger *logger.Logger
}

// Data represents data channels.
type Data struct {
	Usage chan *Usage
}

// NewClient returns new instance of gRPC client.
func NewClient(addr string, config Config, logLevel string) (*Client, error) {
	if config.Cert == "" || config.Key == "" {
		return nil, fmt.Errorf("certificate and key must be specified")
	}
	if err := security.CheckAndGenerateCert(config.Cert, config.Key); err != nil {
		return nil, err
	}

	logger := logger.NewLogger("grpc", logLevel)
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
	data := Data{
		Usage: make(chan *Usage),
	}

	return &Client{
		config: config,
		logger: logger,
		Conn:   conn,
		CLI:    cli,
		Data:   data,
	}, nil
}

// Run connects to worker gRPC server.
func (c *Client) Run() error {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	info, err := c.HostInfo(ctx)
	if err != nil {
		return err
	}
	c.Host = hostInfo(info)
	c.logger.Infof("connected to worker %s %s", c.Host.CertID, c.Conn.Target())

	ch := make(chan error)

	go func() {
		if err := c.Heartbeat(context.Background()); err != nil {
			ch <- err
		}
	}()

	go func() {
		if err := c.UsageStats(context.Background(), c.Data.Usage); err != nil {
			ch <- err
		}
	}()

	err = <-ch
	c.logger.Infof("lost connection to worker %s %s", c.Host.CertID, c.Conn.Target())
	return err
}
