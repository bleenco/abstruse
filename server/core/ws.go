package core

import (
	"path"

	"github.com/bleenco/abstruse/internal/common"
)

func (app *App) broadcastNewBuild(buildID uint) error {
	build, err := app.repo.Build.FindAll(buildID)
	if err != nil {
		return err
	}
	// TODO check for user permissions.
	app.ws.App.Broadcast("/subs/builds", map[string]interface{}{"build": build})
	return nil
}

func (app *App) broadcastJobStatus(job *common.Job) {
	sub := path.Clean(path.Join("/subs", "jobs"))
	event := map[string]interface{}{
		"buildID": job.BuildID,
		"jobID":   job.ID,
		"status":  job.GetStatus(),
	}
	if job.StartTime != nil {
		event["startTime"] = job.StartTime
	}
	if job.EndTime != nil {
		event["endTime"] = job.EndTime
	}
	// TODO: check for permissions
	app.ws.App.Broadcast(sub, event)
}
