package main

import (
	"fmt"
	"net"
	"time"
)

func waitTCP(duration time.Duration, port int) error {
	timeout := time.After(duration)
	tick := time.Tick(1 * time.Second)
	host := fmt.Sprintf("%s:%d", "localhost", port)
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
