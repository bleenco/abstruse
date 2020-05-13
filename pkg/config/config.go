package config

// AppConfig defines configuration for master application.
type AppConfig struct {
	Etcd EtcdConfig `json:"etcd"`
}

// EtcdConfig represents embedded etcd server configuration.
type EtcdConfig struct {
	Name       string `json:"name"`
	Host       string `json:"host"`
	ClientPort int    `json:"client_port"`
	PeerPort   int    `json:"peer_port"`
	DataDir    string `json:"data_dir"`
}
