package app

func (app *App) broadcastNewBuild(buildID uint) error {
	build, err := app.repo.Build.FindAll(buildID)
	if err != nil {
		return err
	}
	// TODO check for user permissions.
	app.ws.Broadcast("/subs/builds", map[string]interface{}{"build": build})
	return nil
}
