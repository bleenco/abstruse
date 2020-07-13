package ws

import (
	"io"
	"net"
	"net/http"
)

// UpstreamHandler proxies HTTP requests to running
// WebSocket server or application.
func UpstreamHandler(addr string) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		peer, err := net.Dial("tcp", addr)
		if err != nil {
			w.WriteHeader(http.StatusBadGateway)
			return
		}
		if err := r.Write(peer); err != nil {
			w.WriteHeader(http.StatusBadGateway)
			return
		}
		hj, ok := w.(http.Hijacker)
		if !ok {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		conn, _, err := hj.Hijack()
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		go pipe(peer, conn)
		go pipe(conn, peer)
	})
}

func pipe(c1 net.Conn, c2 net.Conn) {
	defer c1.Close()
	defer c2.Close()
	io.Copy(c1, c2)
}
