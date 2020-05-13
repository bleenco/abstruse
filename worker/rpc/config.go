package rpc

// Config includes gRPC server configuration properties.
type Config struct {
	ListenAddr string `json:"listen_addr"`
	Cert       string `json:"cert"`
	Key        string `json:"key"`
}
