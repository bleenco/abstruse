package app

import (
	"crypto/tls"
	"net"
	"time"

	"github.com/golang/protobuf/ptypes/empty"
	pb "github.com/jkuri/abstruse/proto"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
)

func (app *App) startServer() error {
	grpcOpts := []grpc.ServerOption{}
	certificate, err := tls.LoadX509KeyPair(app.opts.Cert, app.opts.Key)
	if err != nil {
		return err
	}
	listener, err := net.Listen("tcp", app.addr)
	if err != nil {
		return err
	}
	creds := credentials.NewTLS(&tls.Config{
		Certificates:       []tls.Certificate{certificate},
		InsecureSkipVerify: true,
	})
	grpcOpts = append(grpcOpts, grpc.Creds(creds))
	app.server = grpc.NewServer(grpcOpts...)
	pb.RegisterApiServer(app.server, app)

	app.logger.Infof("gRPC server listening on %s", app.addr)
	return app.server.Serve(listener)
}

func (app *App) stopServer() {
	app.server.Stop()
}

// Heartbeat implements abstruse.api.Heartbeat rpc.
func (app *App) Heartbeat(stream pb.Api_HeartbeatServer) error {
	errch := make(chan error)

	go func() {
		for {
			_, err := stream.Recv()
			if err != nil {
				errch <- err
				break
			}
		}
	}()

	ticker := time.NewTicker(5000 * time.Millisecond)
	for range ticker.C {
		if err := stream.Send(&empty.Empty{}); err != nil {
			errch <- err
		}
	}

	return <-errch
}
