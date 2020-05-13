package rpc

import (
	"io"
	"time"

	"github.com/golang/protobuf/ptypes/empty"
	pb "github.com/jkuri/abstruse/proto"
)

// Heartbeat implements abstruse.api.Heartbeat rpc.
func (s *Server) Heartbeat(stream pb.Api_HeartbeatServer) error {
	for {
		_, err := stream.Recv()
		if err == io.EOF {
			break
		}
		if err != nil {
			return err
		}

		ticker := time.NewTicker(5000 * time.Millisecond)
		for range ticker.C {
			stream.Send(&empty.Empty{})
		}
	}

	return nil
}
