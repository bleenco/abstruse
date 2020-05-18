package grpc

import (
	"context"

	"github.com/golang/protobuf/ptypes/empty"
	pb "github.com/jkuri/abstruse/proto"
)

// HostInfo holds host information about worker.
type HostInfo struct {
	CertID               string `json:"cert_id"`
	Hostname             string `json:"hostname"`
	Uptime               uint64 `json:"uptime"`
	BootTime             uint64 `json:"boot_time"`
	Procs                uint64 `json:"procs"`
	Os                   string `json:"os"`
	Platform             string `json:"platform"`
	PlatformFamily       string `json:"platform_family"`
	PlatformVersion      string `json:"platform_version"`
	KernelVersion        string `json:"kernel_version"`
	KernelArch           string `json:"kernel_arch"`
	VirtualizationSystem string `json:"virtualization_system"`
	VirtualizationRole   string `json:"virtualization_role"`
	HostID               string `json:"host_id"`
}

// HostInfo returns worker host info.
func (w *Worker) HostInfo(ctx context.Context) (*pb.HostInfoReply, error) {
	info, err := w.cli.HostInfo(ctx, &empty.Empty{})
	return info, err
}

func hostInfo(info *pb.HostInfoReply) HostInfo {
	return HostInfo{
		info.GetCertID(),
		info.GetHostname(),
		info.GetUptime(),
		info.GetBootTime(),
		info.GetProcs(),
		info.GetOs(),
		info.GetPlatform(),
		info.GetPlatformFamily(),
		info.GetPlatformVersion(),
		info.GetKernelVersion(),
		info.GetKernelArch(),
		info.GetVirtualizationSystem(),
		info.GetVirtualizationSystem(),
		info.GetHostname(),
	}
}
