package etcd

import "github.com/google/wire"

const (
	// ServicePrefix is etcd global prefix.
	ServicePrefix = "abstruse"
	// WorkerService is etcd worker service prefix.
	WorkerService = "workers"
	// QueueService etcd queue service prefix.
	QueueService = "queue"
)

// ProviderSet export.
var ProviderSet = wire.NewSet(NewOptions, NewServer)
