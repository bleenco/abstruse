package websocket

import (
	"log"
	"net"
	"time"

	"github.com/bleenco/abstruse/pkg/logger"
	"github.com/bleenco/abstruse/server/gopool"
	"github.com/gobwas/ws"
	"github.com/mailru/easygo/netpoll"
)

// Server contains options and methods for running zero-copy
// websocket server on straight TCP connection. Use in a combination
// of UpstreamHandler.
type Server struct {
	logger    *logger.Logger
	addr      string
	pool      *gopool.Pool
	ioTimeout time.Duration
	poller    netpoll.Poller
	exit      chan struct{}
	app       *Application
}

// NewServer initializes and returns a new websocket server instance.
func NewServer(addr string, workers, queue int, ioTimeout time.Duration) *Server {
	poller, err := netpoll.New(nil)
	if err != nil {
		log.Fatal(err)
	}
	pool := gopool.NewPool(workers, queue, 1)
	App = NewApplication()

	return &Server{
		logger.NewLogger("websocket", true, true),
		addr,
		pool,
		ioTimeout,
		poller,
		make(chan struct{}),
		App,
	}
}

// Run starts the websocket server
func (s *Server) Run() error {
	ln, err := net.Listen("tcp", s.addr)
	if err != nil {
		return err
	}

	s.logger.Infof("listening ws server on %s", ln.Addr().String())

	// Create netpoll descriptor for the listener.
	// We use OneShot here to manually resume events stream when we want to.
	desc := netpoll.Must(netpoll.HandleListener(
		ln, netpoll.EventRead|netpoll.EventOneShot,
	))

	accept := make(chan error, 1)

	s.poller.Start(desc, func(e netpoll.Event) {
		// We do not want to accept incoming connection when goroutine pool is
		// busy. So if there are no free goroutines during 1ms we want to
		// cooldown the server and do not receive connection for some
		// short time.
		err := s.pool.ScheduleTimeout(time.Millisecond, func() {
			conn, err := ln.Accept()
			if err != nil {
				accept <- err
				return
			}

			accept <- nil
			s.handle(conn)
		})
		if err == nil {
			err = <-accept
		}
		if err != nil {
			if err != gopool.ErrScheduleTimeout {
				goto cooldown
			}
			if ne, ok := err.(net.Error); ok && ne.Temporary() {
				goto cooldown
			}

			log.Fatalf("accept error: %v", err)

		cooldown:
			delay := 5 * time.Millisecond
			time.Sleep(delay)
		}

		s.poller.Resume(desc)
	})

	<-s.exit
	return nil
}

func (s *Server) handle(conn net.Conn) {
	safeConn := deadliner{conn, s.ioTimeout}

	// Zero-copy upgrade to WebSocket connection.
	hs, err := ws.Upgrade(safeConn)
	if err != nil {
		conn.Close()
		return
	}

	s.logger.Infof("%s: established websocket connection: %+v", nameConn(conn), hs)

	client := s.app.Register(safeConn)

	// Create netpoll event descriptor for conn.
	// We want to handle only read events of it.
	desc := netpoll.Must(netpoll.HandleRead(conn))

	// Subscribe to events about conn.
	s.poller.Start(desc, func(ev netpoll.Event) {
		if ev&(netpoll.EventReadHup|netpoll.EventHup) != 0 {
			// When ReadHup or Hup received, this mean that client has
			// closed at least write end of the connection or connections
			// itself. So we want to stop receive events about such conn
			// and remove it from the chat registry.
			s.poller.Stop(desc)
			s.app.Remove(client)
			return
		}
		// Here we can read some new message from connection.
		// We can not read it right here in callback, because then we will
		// block the poller's inner loop.
		// We do not want to spawn a new goroutine to read single message.
		// But we want to reuse previously spawned goroutine.
		s.pool.Schedule(func() {
			go func(c *Client) {
				s.app.InitClient(c)
			}(client)
		})
	})

}

func nameConn(conn net.Conn) string {
	return conn.LocalAddr().String() + " <> " + conn.RemoteAddr().String()
}

// Deadliner is a wrapper around net.Conn that sets read/write deadlines before
// every Read() or Write() call.
type deadliner struct {
	net.Conn
	t time.Duration
}

func (d deadliner) Write(p []byte) (int, error) {
	if err := d.Conn.SetWriteDeadline(time.Now().Add(d.t)); err != nil {
		return 0, err
	}
	return d.Conn.Write(p)
}

func (d deadliner) Read(p []byte) (int, error) {
	if err := d.Conn.SetReadDeadline(time.Now().Add(d.t)); err != nil {
		return 0, err
	}
	return d.Conn.Read(p)
}
