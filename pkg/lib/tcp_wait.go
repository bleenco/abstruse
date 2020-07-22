package lib

import (
	"fmt"
	"net"
	"time"
)

// WaitTCP is used to wait for external service is available on specific host and port.
func WaitTCP(duration time.Duration, host string, port int) error {
	timeout := time.After(duration)
	tick := time.Tick(1 * time.Second)
	host = fmt.Sprintf("%s:%d", host, port)
	for {
		select {
		case <-timeout:
			return fmt.Errorf("timed out")
		case <-tick:
			conn, err := net.DialTimeout("tcp", host, 500*time.Millisecond)
			if err == nil {
				conn.Close()
				return nil
			}
		}
	}
}
