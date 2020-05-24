package app

import (
	"time"

	"github.com/golang/protobuf/ptypes"
	"github.com/jkuri/abstruse/internal/worker/stats"
	pb "github.com/jkuri/abstruse/proto"
)

// UsageStats implements abstruse.api.UsageStats rpc.
func (app *App) UsageStats(stream pb.Api_UsageStatsServer) error {
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
			Cpu:       cpu,
			Mem:       mem,
			Timestamp: ptypes.TimestampNow(),
		}); err != nil {
			errch <- err
		}
	}

	return <-errch
}
