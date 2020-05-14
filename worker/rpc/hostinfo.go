package rpc

import (
	"context"
	"io/ioutil"

	"github.com/golang/protobuf/ptypes/empty"
	"github.com/jkuri/abstruse/pkg/id"
	pb "github.com/jkuri/abstruse/proto"
	"github.com/jkuri/abstruse/worker/stats"
)

// HostInfo returns worker host information.
func (s *Server) HostInfo(ctx context.Context, in *empty.Empty) (*pb.HostInfoReply, error) {
	cert, err := ioutil.ReadFile(s.cert)
	if err != nil {
		return nil, err
	}
	certid := id.New(cert).String()
	info, err := stats.GetHostStats()
	if err != nil {
		return nil, err
	}

	return &pb.HostInfoReply{
		CertID:               certid,
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
