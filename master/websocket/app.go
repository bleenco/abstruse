package websocket

import (
	"errors"
	"net"
	"sync"

	"github.com/jkuri/abstruse/pkg/logger"
)

// App contains logic of client interaction.
type App struct {
	mu      sync.RWMutex
	Log     *logger.Logger
	Clients []*Client
}

// NewApp inits new app instance and returns it.
func NewApp(log *logger.Logger) *App {
	return &App{
		Log: log,
	}
}

// Register registers new connection as app Client.
func (app *App) Register(conn net.Conn, id int, email, name string) *Client {
	client := &Client{
		conn:  conn,
		c:     conn,
		id:    id,
		email: email,
		name:  name,
	}

	app.mu.Lock()
	app.Clients = append(app.Clients, client)
	app.mu.Unlock()

	app.Log.Debugf("ws user %s (%s) registered", name, email)

	return client
}

// Remove removes client from app.
func (app *App) Remove(client *Client) {
	app.mu.Lock()
	defer app.mu.Unlock()

	for i, c := range app.Clients {
		if c == client {
			app.Clients = append(app.Clients[:i], app.Clients[i+1:]...)
			app.Log.Debugf("ws user disconnected: %s", client.c.RemoteAddr().String())
		}
	}
}

// Broadcast sends socket event to all subscribers.
func (app *App) Broadcast(event string, data map[string]interface{}, checks map[string]interface{}) {
	// var clients []*Client

	// for _, c := range app.Clients {
	// 	for _, sub := range c.subs {
	// 		if sub.Event == event && checkValidSubscription(sub.Data, checks, false) {
	// 			clients = append(clients, c)
	// 		}
	// 	}
	// }

	// for _, client := range clients {
	// 	if err := client.Send(event, data); err != nil {
	// 		app.Log.Debugf("error: %s\n", err.Error())
	// 	}
	// }
}

// InitClient initializes reading client input messages.
func (app *App) InitClient(client *Client) {
	for {
		// msg, err := client.Receive()
		// if err != nil {
		// 	return
		// }

		// if msg.Type == "subscribe" {
		// 	var data map[string]interface{}
		// 	if d, ok := msg.Data["data"].(map[string]interface{}); ok {
		// 		data = d
		// 	}
		// 	client.subscribe(msg.Data["event"].(string), data)
		// }

		// if msg.Type == "unsubscribe" {
		// 	var data map[string]interface{}
		// 	if d, ok := msg.Data["data"].(map[string]interface{}); ok {
		// 		data = d
		// 	}
		// 	client.unsubscribe(msg.Data["event"].(string), data)
		// }
	}
}

func (app *App) clientIndex(client *Client) (int, error) {
	var index int

	for i, c := range app.Clients {
		if c == client {
			index = i
			return index, nil
		}
	}

	return index, errors.New("client not found")
}
