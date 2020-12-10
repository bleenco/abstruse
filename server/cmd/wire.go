// +build wireinject

package cmd

import (
	"github.com/bleenco/abstruse/server/api"
	"github.com/bleenco/abstruse/server/http"
	"github.com/bleenco/abstruse/server/logger"
	"github.com/bleenco/abstruse/server/scheduler"
	"github.com/bleenco/abstruse/server/store"
	"github.com/bleenco/abstruse/server/store/build"
	"github.com/bleenco/abstruse/server/store/job"
	"github.com/bleenco/abstruse/server/store/provider"
	"github.com/bleenco/abstruse/server/store/repo"
	"github.com/bleenco/abstruse/server/store/team"
	"github.com/bleenco/abstruse/server/store/user"
	"github.com/bleenco/abstruse/server/worker"
	"github.com/bleenco/abstruse/server/ws"
	"github.com/google/wire"
)

func CreateApp() (*app, error) {
	panic(wire.Build(wire.NewSet(
		wire.NewSet(store.New),
		wire.NewSet(api.New),
		wire.NewSet(user.New),
		wire.NewSet(team.New),
		wire.NewSet(provider.New),
		wire.NewSet(build.New),
		wire.NewSet(job.New),
		wire.NewSet(repo.New),
		wire.NewSet(worker.NewRegistry),
		wire.NewSet(http.New),
		wire.NewSet(logger.New),
		wire.NewSet(ws.New),
		wire.NewSet(scheduler.New),
		wire.NewSet(newApp, newConfig),
	)))
}
