package core

import (
	"sync"

	"github.com/bleenco/abstruse/pkg/logger"
	pb "github.com/bleenco/abstruse/proto"
	"github.com/pkg/errors"
)

// Registry is exported main worker registry instance.
var Registry *WorkerRegistry

// WorkerRegistryItem holds information about worker.
type WorkerRegistryItem struct {
	Online bool

	JobProcessStream           pb.ApiService_JobProcessServer
	WorkerUsageStatusStream    pb.ApiService_WorkerUsageStatusServer
	WorkerCapacityStatusStream pb.ApiService_WorkerCapacityStatusServer

	Capacity     int
	CapacityUsed int
	CPU          int
	Memory       int
}

// WorkerRegistry defines registry for workers.
type WorkerRegistry struct {
	Items  map[string]*WorkerRegistryItem
	mu     sync.RWMutex
	logger *logger.Logger
}

// NewWorkerRegistry initializes and returns new instance of worker registry.
func NewWorkerRegistry(logger *logger.Logger) *WorkerRegistry {
	registry := &WorkerRegistry{
		Items:  make(map[string]*WorkerRegistryItem),
		logger: logger,
	}
	Registry = registry

	return registry
}

// Subscribe allows to connect worker with a given identifier.
func (wr *WorkerRegistry) Subscribe(identifier string) {
	wr.mu.Lock()
	defer wr.mu.Unlock()

	if _, ok := wr.Items[identifier]; ok {
		wr.Items[identifier].Online = true
		return
	}

	wr.logger.Debugf("worker %s subscribed\n", identifier)

	wr.Items[identifier] = &WorkerRegistryItem{
		Online: true,
	}
}

// IsSubscribed returns true if worker is subscribed.
func (wr *WorkerRegistry) IsSubscribed(identifier string) bool {
	wr.mu.RLock()
	defer wr.mu.RUnlock()
	_, ok := wr.Items[identifier]
	return ok
}

// Unsubscribe removes worker from registry.
func (wr *WorkerRegistry) Unsubscribe(identifier string) {
	wr.mu.Lock()
	defer wr.mu.Unlock()

	_, ok := wr.Items[identifier]
	if !ok {
		return
	}

	wr.logger.Debugf("worker %s unsubscribed\n", identifier)

	delete(wr.Items, identifier)
}

// Find returns worker registry item.
func (wr *WorkerRegistry) Find(identifier string) (*WorkerRegistryItem, error) {
	wr.mu.RLock()
	defer wr.mu.RUnlock()
	item, ok := wr.Items[identifier]
	if !ok {
		return item, errors.New("no available workers found")
	}
	return item, nil
}

// GetWorkersCapacityInfo returns ccurrent total capacity status across workers.
func (wr *WorkerRegistry) GetWorkersCapacityInfo() (int, int) {
	wr.mu.Lock()
	defer wr.mu.Unlock()

	total, used := 0, 0

	for _, item := range wr.Items {
		if item.Online {
			total += item.Capacity
			used += item.CapacityUsed
		}
	}

	return total, used
}
