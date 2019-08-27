package websocket

import (
	"encoding/json"
	"io"
	"sync"
	"net"
	"reflect"

	"github.com/gobwas/ws"
	"github.com/gobwas/ws/wsutil"
)

// Client defines websocket connection.
// It contains logic of receiving and sending messages.
// That is, there are no active reader or writer. Some other layer
// of the application should call Receive() to read user's
// incoming message.
type Client struct {
	io   sync.Mutex
	conn io.ReadWriteCloser
	c    net.Conn

	id    int
	email string
	name  string

	subs []*subscription
	app  *Application
}

type subscription struct {
	Event string
	Data  map[string]interface{}
}

// Receive reads next message from user's underlying connection.
// It blocks until full message received.
func (c *Client) Receive() (*Message, error) {
	msg, err := c.readMessage()
	if err != nil {
		c.conn.Close()
		return nil, err
	}
	if msg == nil {
		// Handled some control message.
		return nil, nil
	}

	return msg, nil
}

// Send sends message to user's underlying connection.
func (c *Client) Send(mtype string, data Object) error {
	return c.writeTo(mtype, data)
}

// readRequests reads json-rpc request from connection.
// It takes io mutex.
func (c *Client) readMessage() (*Message, error) {
	c.io.Lock()
	defer c.io.Unlock()

	h, r, err := wsutil.NextReader(c.conn, ws.StateServerSide)
	if err != nil {
		return nil, err
	}
	if h.OpCode.IsControl() {
		return nil, wsutil.ControlFrameHandler(c.conn, ws.StateServerSide)(h, r)
	}

	msg := &Message{}
	decoder := json.NewDecoder(r)
	if err := decoder.Decode(msg); err != nil {
		return nil, err
	}

	return msg, nil
}

func (c *Client) writeTo(mtype string, data Object) error {
	return c.write(Message{
		Type: mtype,
		Data: data,
	})
}

func (c *Client) writeErrorTo(data Object) error {
	err := &Message{Type: "error", Data: data}
	return c.write(err)
}

func (c *Client) write(x interface{}) error {
	w := wsutil.NewWriter(c.conn, ws.StateServerSide, ws.OpText)
	encoder := json.NewEncoder(w)

	if err := encoder.Encode(x); err != nil {
		return err
	}

	return w.Flush()
}

func (c *Client) writeRaw(p []byte) error {
	c.io.Lock()
	defer c.io.Unlock()

	_, err := c.conn.Write(p)

	return err
}

func (c *Client) subscribe(event string, data map[string]interface{}) {
	if !c.isSubscribed(event, data) {
		c.subs = append(c.subs, &subscription{Event: event, Data: data})
	}
}

func (c *Client) unsubscribe(event string, data map[string]interface{}) {
	for i, s := range c.subs {
		if s.Event == event && reflect.DeepEqual(s.Data, data) {
			c.subs = append(c.subs[:i], c.subs[i+1:]...)
		}
	}
}

func (c *Client) isSubscribed(event string, data map[string]interface{}) bool {
	for _, s := range c.subs {
		if s.Event == event && reflect.DeepEqual(s.Data, data) {
			return true
		}
	}

	return false
}
