package worker

import (
	"context"
	"crypto/tls"
	"errors"
	"io"
	"os"
	"time"

	"github.com/bleenco/abstruse/pkg/logger"
	pb "github.com/bleenco/abstruse/proto"
	"github.com/bleenco/abstruse/worker/auth"
	"github.com/bleenco/abstruse/worker/id"
	"github.com/docker/docker/api/types"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
)

// Client is exported main grpc client instance.
var Client *GRPCClient

// GRPCClient represents workers gRPC client.
type GRPCClient struct {
	identifier id.ID
	logger     *logger.Logger
	conn       *grpc.ClientConn
	client     pb.ApiServiceClient

	JobProcessStream           pb.ApiService_JobProcessClient
	ContainerOutputStream      pb.ApiService_ContainerOutputClient
	WorkerUsageStatusStream    pb.ApiService_WorkerUsageStatusClient
	WorkerCapacityStatusStream pb.ApiService_WorkerCapacityStatusClient
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
	c.logger.Infof("connecting to gRPC server...")
	ch := make(chan error)

	go func() {
		if err := c.StreamOnlineStatus(context.Background()); err != nil {
			ch <- err
		}
	}()

	go func() {
		if err := c.StreamJobProcess(context.Background()); err != nil {
			ch <- err
		}
	}()

	go func() {
		if err := c.StreamWorkerUsageStatus(context.Background()); err != nil {
			ch <- err
		}
	}()

	go func() {
		if err := c.StreamWorkerCapacityStatus(context.Background()); err != nil {
			ch <- err
		}
	}()

	return <-ch
}

// StreamOnlineStatus streams status about worker to server.
func (c *GRPCClient) StreamOnlineStatus(ctx context.Context) error {
	stream, err := c.client.OnlineCheck(ctx)
	if err != nil {
		return err
	}
	defer stream.CloseSend()
	c.logger.Infof("connected to gRPC server")

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

// StreamWorkerCapacityStatus streams worker capacity information to the server.
func (c *GRPCClient) StreamWorkerCapacityStatus(ctx context.Context) error {
	stream, err := c.client.WorkerCapacityStatus(ctx)
	if err != nil {
		return err
	}

	c.WorkerCapacityStatusStream = stream

	status := &pb.WorkerCapacity{
		Total: int32(WorkerProcess.Queue.Concurrency),
		Used:  int32(WorkerProcess.Queue.Used),
	}
	if err := stream.Send(status); err != nil {
		return err
	}

	return nil
}

// UpdateWorkerCapacityStatus sends latest capacity information to server.
func (c *GRPCClient) UpdateWorkerCapacityStatus(ctx context.Context) error {
	if c.WorkerCapacityStatusStream == nil {
		return nil
	}

	status := &pb.WorkerCapacity{
		Total: int32(WorkerProcess.Queue.Concurrency),
		Used:  int32(WorkerProcess.Queue.Used),
	}

	if err := c.WorkerCapacityStatusStream.Send(status); err != nil {
		return err
	}

	return nil
}

// StreamWorkerUsageStatus streams worker informational statistics about system
// usage for CPU and memory.
func (c *GRPCClient) StreamWorkerUsageStatus(ctx context.Context) error {
	stream, err := c.client.WorkerUsageStatus(ctx)
	if err != nil {
		return err
	}

	defer func() {
		stream.CloseSend()
		c.WorkerUsageStatusStream = nil
	}()

	c.WorkerUsageStatusStream = stream

	for {
		cpu, mem := getWorkerUsageStats()
		usage := &pb.WorkerUsage{
			Cpu:    cpu,
			Memory: mem,
		}
		if err := stream.Send(usage); err != nil {
			return err
		}

		time.Sleep(5 * time.Second)
	}
}

// StreamJobProcess streams job build status from client to server and
// job tasks that should be queued and eventually runned on worker.
func (c *GRPCClient) StreamJobProcess(ctx context.Context) error {
	stream, err := c.client.JobProcess(ctx)
	if err != nil {
		return err
	}

	defer func() {
		stream.CloseSend()
		c.JobProcessStream = nil
	}()

	c.JobProcessStream = stream

	for {
		jobTask, err := stream.Recv()
		if err != nil {
			return err
		}

		WorkerProcess.Queue.job <- jobTask

		if err := SendQueuedStatus("", jobTask.GetName()); err != nil {
			return err
		}
	}
}

// StreamContainerOutput streams output log of container to server.
func (c *GRPCClient) StreamContainerOutput(ctx context.Context, conn types.HijackedResponse, containerID, containerName string) error {
	stream, err := c.client.ContainerOutput(ctx)
	if err != nil {
		return err
	}

	defer func() {
		defer stream.CloseSend()
		c.ContainerOutputStream = nil
	}()

	c.ContainerOutputStream = stream

	for {
		buf := make([]byte, 4096)
		n, err := conn.Reader.Read(buf)
		if err != nil {
			conn.Close()
			return nil
		}

		// stream output log to server
		if err := stream.Send(&pb.ContainerOutputChunk{
			Id:      containerID,
			Name:    containerName,
			Content: buf[:n],
		}); err != nil {
			return err
		}
	}
}

// WriteContainerOutput writes text of container to server.
func (c *GRPCClient) WriteContainerOutput(containerID, containerName, text string) error {
	if c.ContainerOutputStream == nil {
		return nil
	}

	if err := c.ContainerOutputStream.Send(&pb.ContainerOutputChunk{
		Id:      containerID,
		Name:    containerName,
		Content: []byte(text),
	}); err != nil {
		return err
	}

	return nil
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
