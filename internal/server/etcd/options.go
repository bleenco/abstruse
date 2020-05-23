package etcd

import "github.com/spf13/viper"

// Options configuration for etcd embedded server.
type Options struct {
	Name       string
	Host       string
	ClientPort int
	PeerPort   int
	DataDir    string
	Cert       string
	Key        string
	Username   string
	Password   string
}

// NewOptions returns configuration for etcd server.
func NewOptions(v *viper.Viper) (*Options, error) {
	var (
		err error
		o   = new(Options)
	)

	if err = v.UnmarshalKey("etcd", o); err != nil {
		return nil, err
	}

	return o, err
}
