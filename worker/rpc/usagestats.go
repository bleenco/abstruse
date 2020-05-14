package rpc

import (
	"time"

	pb "github.com/jkuri/abstruse/proto"
	"github.com/jkuri/abstruse/worker/stats"
)

// UsageStats implements abstruse.api.UsageStats rpc.
func (s *Server) UsageStats(stream pb.Api_UsageStatsServer) error {
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

	ticker := time.NewTicker(5 * time.Second)
	for range ticker.C {
		cpu, mem := stats.GetUsageStats()
		if err := stream.Send(&pb.UsageStatsReply{
			Cpu: cpu,
			Mem: mem,
		}); err != nil {
			errch <- err
		}
	}

	return <-errch
}
