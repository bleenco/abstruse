package websocket

import (
	"errors"
	"net"
	"sync"

	"github.com/bleenco/abstruse/pkg/logger"
)

// App is an Application instance.
var App *Application

// Application contains logic of client interaction.
type Application struct {
	mu      sync.RWMutex
	Clients []*Client
	Logger  *logger.Logger
}

// NewApplication inits new app instance and returns it.
func NewApplication(log *logger.Logger) *Application {
	return &Application{
		Logger: log,
	}
}

// Register registers new connection as a Client.
func (a *Application) Register(conn net.Conn, id int, email, name string) *Client {
	client := &Client{
		conn: conn,
		c:    conn,
		app:  a,
		id: id,
		email: email,
		name: name,
	}

	a.mu.Lock()
	a.Clients = append(a.Clients, client)
	a.mu.Unlock()

	a.Logger.Debugf("ws user %s (%s) registered", name, email)

	return client
}

// Remove removes client from app.
func (a *Application) Remove(client *Client) {
	a.mu.Lock()
	defer a.mu.Unlock()

	for i, c := range a.Clients {
		if c == client {
			a.Clients = append(a.Clients[:i], a.Clients[i+1:]...)
			a.Logger.Debugf("ws user disconnected: %s", client.c.RemoteAddr().String())
		}
	}
}

// Broadcast sends socket event to all subscribers.
func (a *Application) Broadcast(event string, data map[string]interface{}, checks map[string]interface{}) {
	var clients []*Client

	for _, c := range a.Clients {
		for _, sub := range c.subs {
			if sub.Event == event && checkValidSubscription(sub.Data, checks) {
				clients = append(clients, c)
			}
		}
	}

	for _, client := range clients {
		if err := client.Send(event, data); err != nil {
			a.Logger.Debugf("error: %s\n", err.Error())
		}
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
			client.subscribe(msg.Data["event"].(string), msg.Data)
		}

		if msg.Type == "unsubscribe" {
			client.unsubscribe(msg.Data["event"].(string), msg.Data)
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

func checkValidSubscription(data, checks map[string]interface{}) bool {
	for key, value := range data {
		for k, v := range data {
			if key == k && value == v {
				return true
			}
		}
	}

	return false
}