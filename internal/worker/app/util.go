package app

import (
	"github.com/jkuri/abstruse/internal/pkg/util"
)

func (app *App) getAddress() string {
	return util.GetListenAddress(app.opts.GRPC.ListenAddr)
}
