package websocket

import (
	"io"
	"net"
	"net/http"

	"github.com/julienschmidt/httprouter"
)

// UpstreamHandler proxies HTTP requests to running
// WebSocket server or application.
func UpstreamHandler(addr string) httprouter.Handle {
	return httprouter.Handle(func(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
		r.Header.Set("Authentication", r.Header.Get("Sec-Websocket-Protocol"))

		peer, err := net.Dial("tcp", addr)
		if err != nil {
			w.WriteHeader(502)
			return
		}
		if err := r.Write(peer); err != nil {
			w.WriteHeader(502)
			return
		}

		hj, ok := w.(http.Hijacker)
		if !ok {
			w.WriteHeader(500)
			return
		}
		conn, _, err := hj.Hijack()
		if err != nil {
			w.WriteHeader(500)
			return
		}

		go func() {
			defer peer.Close()
			defer conn.Close()
			io.Copy(peer, conn)
		}()

		go func() {
			defer peer.Close()
			defer conn.Close()
			io.Copy(conn, peer)
		}()
	})
}
