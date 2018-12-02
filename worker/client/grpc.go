package client

import (
	"context"
	"crypto/tls"
	"errors"
	"io"
	"os"
	"time"

	"github.com/bleenco/abstruse/id"
	"github.com/bleenco/abstruse/logger"
	"github.com/bleenco/abstruse/worker/auth"
	pb "github.com/bleenco/abstruse/proto"
	"github.com/docker/docker/api/types"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"github.com/golang/protobuf/ptypes/empty"
)

// Client is exported main grpc client instance.
var Client *GRPCClient

// GRPCClient represents workers gRPC client.
type GRPCClient struct {
	identifier id.ID
	logger     *logger.Logger
	conn       *grpc.ClientConn
	client     pb.ApiServiceClient
}

// UploadStats defines basic upload statistics.
type UploadStats struct {
	StartedAt  time.Time
	FinishedAt time.Time
	BytesSent  int64
}

// NewGRPCClient returns new instance of GRPCClient.
func NewGRPCClient(identifier id.ID, jwt, address, cert, key string, logger *logger.Logger) (*GRPCClient, error) {
	if address == "" {
		return nil, errors.New("grpc address endpoint must be specified")
	}

	if cert == "" {
		return nil, errors.New("grpc client cert must be specified")
	}

	var grpcOpts = []grpc.DialOption{}

	certificate, err := tls.LoadX509KeyPair(cert, key)
	if err != nil {
		return nil, err
	}

	creds := credentials.NewTLS(&tls.Config{
		Certificates:       []tls.Certificate{certificate},
		InsecureSkipVerify: true,
	})

	auth := &auth.Authentication{
		Identifier: identifier.String(),
		JWT:        jwt,
	}

	grpcOpts = append(grpcOpts, grpc.WithTransportCredentials(creds))
	grpcOpts = append(grpcOpts, grpc.WithPerRPCCredentials(auth))

	conn, err := grpc.Dial(address, grpcOpts...)
	if err != nil {
		return nil, errors.New("failed to start grpc session to address: " + address)
	}

	client := pb.NewApiServiceClient(conn)

	c := &GRPCClient{
		identifier: identifier,
		logger:     logger,
		conn:       conn,
		client:     client,
	}
	Client = c

	return c, nil
}

// Run starts worker gRPC client.
func (c *GRPCClient) Run() error {
	defer c.Close()

	if err := c.StreamOnlineStatus(context.Background()); err != nil {
		return err
	}

	return nil
}

// StreamOnlineStatus streams status about worker to server.
func (c *GRPCClient) StreamOnlineStatus(ctx context.Context) error {
	stream, err := c.client.OnlineCheck(ctx)
	if err != nil {
		return err
	}
	defer stream.CloseSend()

	for {
		status := &pb.OnlineStatus{
			Identifier: c.identifier.String(),
			Code:       pb.OnlineStatus_Up,
		}
		if err := stream.Send(status); err != nil {
			return err
		}

		time.Sleep(5 * time.Second)
	}
}

// StreamContainerOutput streams output log of container to server.
func (c *GRPCClient) StreamContainerOutput(ctx context.Context, conn types.HijackedResponse, containerID string) (*empty.Empty, error) {
	stream, err := c.client.ContainerOutput(ctx)
	if err != nil {
		return nil, err
	}
	defer stream.CloseSend()

	for {
		buf := make([]byte, 4096)
		n, err := conn.Reader.Read(buf)
		if err != nil {
			conn.Close()
			return nil, nil
		}

		// stream output log to server
		if err := stream.Send(&pb.ContainerOutputChunk{
			Id: containerID,
			Content: buf[:n],
		}); err != nil {
			return nil, err
		}
	}
}

// UploadFile uploads file to server.
func (c *GRPCClient) UploadFile(ctx context.Context, f string) (*UploadStats, error) {
	file, err := os.Open(f)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	stream, err := c.client.Upload(ctx)
	if err != nil {
		return nil, err
	}
	defer stream.CloseSend()

	stats := &UploadStats{
		StartedAt: time.Now(),
	}
	chunkSize := 1024
	buf := make([]byte, chunkSize)

	for {
		n, err := file.Read(buf)
		if err != nil {
			if err == io.EOF {
				break
			}

			return nil, err
		}

		if err := stream.Send(&pb.Chunk{
			Content: buf[:n],
		}); err != nil {
			return nil, err
		}
		stats.BytesSent += int64(n)
	}

	stats.FinishedAt = time.Now()

	status, err := stream.CloseAndRecv()
	if err != nil {
		return nil, err
	}

	if status.Code != pb.TransferStatusCode_Ok {
		return nil, err
	}

	return stats, nil
}

// Close closes gRPC connection.
func (c *GRPCClient) Close() {
	if c.conn != nil {
		c.conn.Close()
	}
}
