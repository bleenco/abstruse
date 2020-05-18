package websocket

import "github.com/spf13/viper"

// Options configuration for websocket server.
type Options struct {
	Addr string
}

// NewOptions returns configuration for websocket server.
func NewOptions(v *viper.Viper) (*Options, error) {
	var (
		err error
		o   = new(Options)
	)

	if err = v.UnmarshalKey("websocket", o); err != nil {
		return nil, err
	}

	return o, err
}
