package options

import (
	"github.com/jkuri/abstruse/internal/pkg/auth"
	"github.com/jkuri/abstruse/internal/pkg/log"
	"github.com/spf13/viper"
)

type (
	// Options are global config for the server app.
	Options struct {
		Cert      string
		Key       string
		HTTP      *HTTP
		Websocket *WebSocket
		DB        *DB
		Etcd      *ETCD
		Auth      *auth.Options
		Log       *log.Options
	}

	// HTTP config for HTTP server.
	HTTP struct {
		Addr    string
		TLSAddr string
	}

	// ETCD configuration for etcd embedded server.
	ETCD struct {
		Name       string
		Host       string
		ClientPort int
		PeerPort   int
		DataDir    string
		Username   string
		Password   string
	}

	// DB database configuration
	DB struct {
		Client   string
		Hostname string
		Port     int
		User     string
		Password string
		Database string
		Charset  string
	}

	// WebSocket configuration
	WebSocket struct {
		Addr string
	}
)

// NewOptions returns server app config.
func NewOptions(v *viper.Viper) (*Options, error) {
	opts := &Options{}
	err := v.Unmarshal(opts)
	return opts, err
}
