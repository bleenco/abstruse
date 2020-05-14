package etcdserver

// Config represents embedded etcd server configuration.
type Config struct {
	Name       string `json:"name"`
	Host       string `json:"host"`
	ClientPort int    `json:"client_port"`
	PeerPort   int    `json:"peer_port"`
	DataDir    string `json:"data_dir"`
	Cert       string `json:"cert"`
	Key        string `json:"key"`
}
