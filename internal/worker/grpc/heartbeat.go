package grpc

import (
	"time"

	"github.com/golang/protobuf/ptypes/empty"
	pb "github.com/jkuri/abstruse/proto"
)

// Heartbeat implements abstruse.api.Heartbeat rpc.
func (s *Server) Heartbeat(stream pb.Api_HeartbeatServer) error {
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
