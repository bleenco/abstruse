package grpc

import (
	"context"

	"github.com/golang/protobuf/ptypes/empty"
	"github.com/jkuri/abstruse/internal/worker/stats"
	pb "github.com/jkuri/abstruse/proto"
)

// HostInfo returns worker host information.
func (s *Server) HostInfo(ctx context.Context, in *empty.Empty) (*pb.HostInfoReply, error) {
	info, err := stats.GetHostStats()
	if err != nil {
		return nil, err
	}

	return &pb.HostInfoReply{
		Id:                   s.id,
		Addr:                 s.addr,
		Hostname:             info.Hostname,
		Uptime:               info.Uptime,
		BootTime:             info.BootTime,
		Procs:                info.Procs,
		Os:                   info.OS,
		Platform:             info.Platform,
		PlatformFamily:       info.PlatformFamily,
		PlatformVersion:      info.PlatformVersion,
		KernelVersion:        info.KernelVersion,
		KernelArch:           info.KernelArch,
		VirtualizationSystem: info.VirtualizationRole,
		VirtualizationRole:   info.VirtualizationRole,
		HostID:               info.HostID,
	}, nil
}
