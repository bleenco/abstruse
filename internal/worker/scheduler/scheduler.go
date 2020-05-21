package scheduler

import (
	"path"
	"sync"

	"github.com/google/wire"
	"github.com/jkuri/abstruse/internal/pkg/etcdutil"
	"github.com/jkuri/abstruse/internal/pkg/shared"
	"github.com/jkuri/abstruse/internal/worker/etcd"
	jsoniter "github.com/json-iterator/go"
	"go.etcd.io/etcd/clientv3"
	"go.uber.org/zap"
)

// Scheduler service maintains and updates status of worker and its
// occupancy with job tasks.
type Scheduler struct {
	mu          sync.Mutex
	opts        *Options
	logger      *zap.SugaredLogger
	etcd        *etcd.App
	keyPrefix   string
	rkv         *etcdutil.RemoteKV
	Current     int `json:"current"`
	Max         int `json:"max"`
	availableCh chan int
	init        bool
}

// NewScheduler returns new instance of a Scheduler.
func NewScheduler(opts *Options, logger *zap.Logger, etcd *etcd.App) *Scheduler {
	return &Scheduler{
		opts:        opts,
		etcd:        etcd,
		logger:      logger.With(zap.String("type", "scheduler")).Sugar(),
		Current:     0,
		Max:         opts.Max,
		availableCh: make(chan int),
		init:        false,
	}
}

// Init initializes info on etcd server.
func (s *Scheduler) Init(certid string) {
	client := s.etcd.Client()
	s.keyPrefix = path.Join(shared.ServicePrefix, shared.WorkerCapacity, certid)
init:
	value := s.toJSON()
	rkv, err := etcdutil.NewRemoteKV(
		client.KV,
		s.keyPrefix,
		value,
		clientv3.NoLease,
	)
	if err != nil {
		rkv = &etcdutil.RemoteKV{KV: client.KV, Key: s.keyPrefix, Val: value}
		rkv.Delete()
		goto init
	}
	s.init = true
	s.logger.Infof("scheduler initialized")
}

// UpdateCapacity updates capacity on etcd server.
func (s *Scheduler) UpdateCapacity(current int) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.Current = current
}

func (s *Scheduler) toJSON() string {
	value, _ := jsoniter.MarshalToString(s)
	return value
}

// WaitOnAvailable waits that current capacity is lower than max.
func (s *Scheduler) WaitOnAvailable() {
	<-s.availableCh
}

// ProviderSet exports for wire.
var ProviderSet = wire.NewSet(NewOptions, NewScheduler)
