package server

import (
	"sync"

	"github.com/bleenco/abstruse/id"
	"github.com/bleenco/abstruse/logger"
)

// WorkerRegistryItem holds information about worker.
type WorkerRegistryItem struct {
	Online bool
}

// WorkerRegistry defines registry for workers.
type WorkerRegistry struct {
	items  map[id.ID]*WorkerRegistryItem
	mu     sync.RWMutex
	logger *logger.Logger
}

// NewWorkerRegistry initializes and returns new instance of worker registry.
func NewWorkerRegistry(logger *logger.Logger) *WorkerRegistry {
	return &WorkerRegistry{
		items:  make(map[id.ID]*WorkerRegistryItem),
		logger: logger,
	}
}

// Subscribe allows to connect worker with a given identifier.
func (wr *WorkerRegistry) Subscribe(identifier id.ID) {
	wr.mu.Lock()
	defer wr.mu.Unlock()

	if _, ok := wr.items[identifier]; ok {
		return
	}

	wr.logger.Debugf("worker %s subscribed\n", identifier)

	wr.items[identifier] = &WorkerRegistryItem{Online: true}
}
