package worker

import (
	"context"
	"errors"
	"io"
	"os"
	"time"

	"github.com/bleenco/abstruse/logger"
	pb "github.com/bleenco/abstruse/proto"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	_ "google.golang.org/grpc/encoding/gzip" // gzip compressor
)

// GRPCClient represents workers gRPC client.
type GRPCClient struct {
	logger *logger.Logger
	conn   *grpc.ClientConn
	client pb.ApiServiceClient
}

// GRPCClientConfig defines configuration for gRPC client.
type GRPCClientConfig struct {
	Address         string
	RootCertificate string
	Compress        bool
}

// NewGRPCClient returns new instance of GRPCClient.
func NewGRPCClient(cfg *GRPCClientConfig, logger *logger.Logger) (*GRPCClient, error) {
	var grpcOpts = []grpc.DialOption{}

	if cfg.Address == "" {
		return nil, errors.New("grpc address endpoint must be specified")
	}

	if cfg.Compress {
		grpcOpts = append(grpcOpts, grpc.WithDefaultCallOptions(grpc.UseCompressor("gzip")))
	}

	if cfg.RootCertificate != "" {
		grpcCreds, err := credentials.NewClientTLSFromFile(cfg.RootCertificate, "localhost")
		if err != nil {
			return nil, err
		}
		grpcOpts = append(grpcOpts, grpc.WithTransportCredentials(grpcCreds))
	} else {
		grpcOpts = append(grpcOpts, grpc.WithInsecure())
	}

	conn, err := grpc.Dial(cfg.Address, grpcOpts...)
	if err != nil {
		return nil, errors.New("failed to start grpc session to address: " + cfg.Address)
	}

	client := pb.NewApiServiceClient(conn)

	return &GRPCClient{
		logger: logger,
		conn:   conn,
		client: client,
	}, nil
}

// UploadFile uploads file to server.
func (c *GRPCClient) UploadFile(ctx context.Context, f string) (*UploadStats, error) {
	file, err := os.Open(f)
	if err != nil {
		return nil, errors.New("failed to open file " + f + ", error: " + err.Error())
	}
	defer file.Close()

	stream, err := c.client.Upload(ctx)
	if err != nil {
		return nil, errors.New("failed to initialize upload stream for file " + f + ", error: " + err.Error())
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

			return nil, errors.New("errored while copying from file to buffer")
		}

		if err := stream.Send(&pb.Chunk{
			Content: buf[:n],
		}); err != nil {
			return nil, errors.New("failed to send chunk via stream, error: " + err.Error())
		}
		stats.BytesSent += int64(n)
	}

	stats.FinishedAt = time.Now()

	status, err := stream.CloseAndRecv()
	if err != nil {
		return nil, errors.New("failed to receive status response from server, error: " + err.Error())
	}

	if status.Code != pb.TransferStatusCode_Ok {
		return nil, errors.New("upload failed - msg: " + status.Message)
	}

	return stats, nil
}

// Close closes gRPC connection.
func (c *GRPCClient) Close() {
	if c.conn != nil {
		c.conn.Close()
	}
}
