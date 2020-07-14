package ws

import (
	"fmt"
	"net"
	"sync"

	"github.com/bleenco/abstruse/internal/auth"
	"go.uber.org/zap"
)

// App contains logic of client interfaction.
type App struct {
	mu      sync.RWMutex
	logger  *zap.SugaredLogger
	Clients []*Client
}

// NewApp inits new app instance and returns it.
func NewApp(logger *zap.SugaredLogger) *App {
	return &App{
		logger: logger,
	}
}

// Register registers new connection as app Client.
func (a *App) Register(conn net.Conn, claims auth.UserClaims) *Client {
	client := &Client{
		conn: conn,
		c:    conn,
		data: claims,
	}

	a.mu.Lock()
	a.Clients = append(a.Clients, client)
	a.mu.Unlock()
	a.logger.Debugf("websocket user %s (id: %d, name: %s) registered", client.data.Email, client.data.ID, client.data.Name)

	return client
}

// Remove removes client from app.
func (a *App) Remove(client *Client) {
	a.mu.Lock()
	defer a.mu.Unlock()

	for i, c := range a.Clients {
		if c == client {
			a.Clients = append(a.Clients[:i], a.Clients[i+1:]...)
		}
	}
}

// Broadcast sends socket event to all subscribers.
func (a *App) Broadcast(sub string, data map[string]interface{}) {
	var clients []*Client

	for _, c := range a.Clients {
		for _, s := range c.subs {
			if s == sub {
				clients = append(clients, c)
			}
		}
	}

	for _, client := range clients {
		if err := client.Send(sub, data); err != nil {
			a.logger.Debugf("error: %s\n", err.Error())
		}
	}
}

// InitClient initializes reading client input messages.
func (a *App) InitClient(client *Client) error {
	for {
		msg, err := client.Receive()
		if err != nil {
			return err
		}

		if msg.Type == "subscribe" {
			var data string
			if d, ok := msg.Data["sub"].(string); ok {
				data = d
			}
			client.subscribe(data)
		}

		if msg.Type == "unsubscribe" {
			var data string
			if d, ok := msg.Data["sub"].(string); ok {
				data = d
			}
			client.unsubscribe(data)
		}
	}
}

func (a *App) clientIndex(client *Client) (int, error) {
	var index int

	for i, c := range a.Clients {
		if c == client {
			index = i
			return index, nil
		}
	}

	return index, fmt.Errorf("client not found")
}
