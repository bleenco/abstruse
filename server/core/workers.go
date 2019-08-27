package core

import (
	"errors"
	"fmt"
	"sync"

	"github.com/bleenco/abstruse/server/api"
	"github.com/bleenco/abstruse/server/db"
	"github.com/bleenco/abstruse/server/websocket"
)

// WorkersAPI is workers registry.
var WorkersAPI *Workers

// Workers defines workers API.
type Workers struct {
	mu    sync.Mutex
	Items []*WorkerItem

	EventEmitter chan api.Event
}

// WorkerItem defines worker item in API.
type WorkerItem struct {
	Data *db.Worker

	EventEmitter chan api.Event
}

// NewWorkersAPI returns workers API instance.
func NewWorkersAPI() *Workers {
	api := &Workers{
		EventEmitter: make(chan api.Event),
	}

	WorkersAPI = api
	go api.eventListener()

	return api
}

func (w *Workers) eventListener() {
	for {
		switch event := <-w.EventEmitter; event.Action {
		case "subscribed":
			{
				data := map[string]interface{}{"cert_id": event.Data, "status": "operational"}
				websocket.App.Broadcast("worker_status", data, nil)
			}
		case "unsubscribed":
			{
				data := map[string]interface{}{"cert_id": event.Data, "status": "down"}
				websocket.App.Broadcast("worker_status", data, nil)
			}
		}
	}
}

// Find finds user by certificate id.
func (w *Workers) Find(certID string) (*WorkerItem, error) {
	w.mu.Lock()
	defer w.mu.Unlock()

	for _, worker := range w.Items {
		if worker.Data.CertID == certID {
			return worker, nil
		}
	}

	return nil, errors.New("worker not found")
}

// Subscribe subscribes user into API registry.
func (w *Workers) Subscribe(certID, ip string) error {
	w.mu.Lock()
	defer w.mu.Unlock()

	item := &WorkerItem{
		Data:         &db.Worker{CertID: certID},
		EventEmitter: make(chan api.Event),
	}

	if w.IsSubscribed(item) {
		return nil
	}

	dbWorker, err := db.FindWorker(item.Data.CertID)
	if err != nil {
		item.Data.Status = "operational"
		item.Data.IP = ip
		if err := item.Data.Create(); err != nil {
			fmt.Println(err)
			return err
		}
	} else {
		item.Data = &dbWorker
		item.Data.UpdateStatus("operational")
		if item.Data.IP != ip {
			item.Data.UpdateIP(ip)
		}
	}

	w.Items = append(w.Items, item)
	w.EventEmitter <- api.Event{Action: "subscribed", Data: certID}

	return nil
}

// Unsubscribe unsubscribes worker from API registry.
func (w *Workers) Unsubscribe(certID string) {
	w.mu.Lock()
	defer w.mu.Unlock()

	for i, worker := range w.Items {
		if worker.Data.CertID == certID {
			worker.Data.UpdateStatus("down")
			w.Items = append(w.Items[:i], w.Items[i+1:]...)
			w.EventEmitter <- api.Event{Action: "unsubscribed", Data: certID}
			break
		}
	}
}

// IsSubscribed returns true if worker is subscribed into API registry.
func (w *Workers) IsSubscribed(item *WorkerItem) bool {
	for _, worker := range w.Items {
		if worker.Data.CertID == item.Data.CertID {
			return true
		}
	}

	return false
}
