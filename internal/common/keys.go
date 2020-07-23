package common

const (
	// WorkerService is etcd worker service prefix.
	WorkerService = "/abstruse/workers/register"
	// WorkersCapacity etcd workers capacity prefix.
	WorkersCapacity = "/abstruse/workers/capacity"
	// WorkersCapacityLock etcd workers capacity lock prefix.
	WorkersCapacityLock = "/abstruse/scheduler/lock"
	// QueuePrefix etcd queue service prefix.
	QueuePrefix = "/abstruse/scheduler/queue"
	// PendingPrefix etcd jobs service prefix.
	PendingPrefix = "/abstruse/scheduler/pending"
	// StopPrefix etcd jobs stop service prefix.
	StopPrefix = "/abstruse/scheduler/stop"
	// DonePrefix etcd jobs done service prefix.
	DonePrefix = "/abstruse/scheduler/done"
	// DefaultQueuePriority global.
	DefaultQueuePriority = 1000
)
