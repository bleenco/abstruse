package shared

const (
	// ServicePrefix is etcd global prefix.
	ServicePrefix = "abstruse"
	// WorkerService is etcd worker service prefix.
	WorkerService = "workers"
	// WorkerCapacity is an etcd prefix that stores
	// info about job capacity for separate worker.
	WorkerCapacity = "capacity"
	// WorkerCapacityLock capacity mutex.
	WorkerCapacityLock = "capacitylock"
	// QueueService etcd queue service prefix.
	QueueService = "queue"
	// DefaultQueuePriority global.
	DefaultQueuePriority = 1000
)
