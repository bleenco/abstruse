package websocket

import (
	"errors"
	"net"
	"sync"
)

// App is an Application instance.
var App *Application

// Application contains logic of client interaction.
type Application struct {
	mu      sync.RWMutex
	Clients []*Client
}

// NewApplication inits new app instance and returns it.
func NewApplication() *Application {
	return &Application{}
}

// Register registers new connection as a Client.
func (a *Application) Register(conn net.Conn) *Client {
	client := &Client{
		conn: conn,
		app:  a,
	}

	a.mu.Lock()
	a.Clients = append(a.Clients, client)
	a.mu.Unlock()

	return client
}

// Remove removes client from app.
func (a *Application) Remove(client *Client) {
	a.mu.Lock()
	defer a.mu.Unlock()

	for i, c := range a.Clients {
		if c == client {
			a.Clients = append(a.Clients[:i], a.Clients[i+1:]...)
		}
	}
}

// Broadcast sends socket event to all subscribers.
func (a *Application) Broadcast(event string, data Object, subscription string) {
	var clients []*Client
	for _, c := range a.Clients {
		for _, sub := range c.subs {
			if sub.Event == subscription {
				clients = append(clients, c)
			}
		}
	}

	for _, client := range clients {
		client.Send(event, data)
	}
}

// InitClient initializes reading client input messages.
func (a *Application) InitClient(client *Client) {
	for {
		msg, err := client.Receive()
		if err != nil {
			return
		}

		if msg.Type == "subscribe" {
			client.subscribe(msg.Data["event"].(string), msg.Data["id"].(string))
		}

		if msg.Type == "unsubscribe" {
			client.unsubscribe(msg.Data["event"].(string), msg.Data["id"].(string))
		}
	}
}

func (a *Application) clientIndex(client *Client) (int, error) {
	var index int

	for i, c := range a.Clients {
		if c == client {
			index = i
			return index, nil
		}
	}

	return index, errors.New("client not found")
}
